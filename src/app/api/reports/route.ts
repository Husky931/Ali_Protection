import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { reports, report_images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReportInsert } from "@/lib/reportTypes";
import { slugify } from "@/lib/slugify";
import {
  MAX_IMAGES_PER_REPORT,
  MAX_RECEIPTS_PER_REPORT,
  MAX_IMAGE_BYTES,
  MAX_RECEIPT_BYTES,
  PENDING_KEY_PATTERN,
  RECEIPT_KEY_PATTERN,
  isAllowedImageType,
  isAllowedReceiptType,
} from "@/lib/images";
import { headObject, deleteObjects, r2Configured } from "@/lib/r2";
import { isRateLimited } from "@/lib/rateLimit";
import { validateReportFields } from "@/lib/validateReport";
import { verifyTurnstile } from "@/lib/turnstile";
import { generateSecret, hashToken } from "@/lib/tokens";

// The submit body plus the anti-abuse / consent fields the form adds.
type ReportBody = ReportInsert & {
  website?: string; // honeypot — humans never fill this
  turnstileToken?: string;
  terms_version?: string;
  receipts?: string[]; // private order-receipt staging keys
  no_receipt_reason?: string; // short reason given when no receipt is attached
};

// Bounds for the no-receipt reason. MIN mirrors the form's client gate so a
// direct API caller can't store a useless 1-char note; MAX stops a runaway
// paste from bloating the row.
const MIN_NO_RECEIPT_REASON = 3;
const MAX_NO_RECEIPT_REASON = 280;

type VerifiedImage = { key: string; contentType: string; sizeBytes: number };

type VerifyResult =
  | { ok: true; images: VerifiedImage[] }
  | { ok: false; error: string; status: number };

// Verifies a batch of client-supplied R2 keys: correct staging prefix, count
// within `max`, and each object actually present with an allowed type/size. On
// any bad object the whole batch is deleted (we never publish what we can't
// vouch for). Empty input is valid — uploads are optional.
async function verifyUploadBatch(
  rawKeys: unknown,
  pattern: RegExp,
  max: number,
  noun: string,
  typeAllowed: (value: string) => boolean,
  maxBytes: number,
): Promise<VerifyResult> {
  const keys = Array.from(
    new Set(Array.isArray(rawKeys) ? rawKeys : []),
  ).filter((k): k is string => typeof k === "string");

  if (keys.length === 0) return { ok: true, images: [] };
  if (!r2Configured()) {
    return {
      ok: false,
      error: "Image uploads are not available right now.",
      status: 400,
    };
  }
  if (keys.length > max) {
    return { ok: false, error: `At most ${max} ${noun} per report.`, status: 400 };
  }
  if (keys.some((key) => !pattern.test(key))) {
    return { ok: false, error: "Invalid image reference.", status: 400 };
  }

  const images: VerifiedImage[] = [];
  try {
    for (const key of keys) {
      const meta = await headObject(key);
      if (
        !meta ||
        !typeAllowed(meta.contentType) ||
        meta.sizeBytes <= 0 ||
        meta.sizeBytes > maxBytes
      ) {
        await deleteObjects(keys);
        return {
          ok: false,
          error: `One or more ${noun} could not be verified. Please re-attach them and try again.`,
          status: 400,
        };
      }
      images.push({
        key,
        contentType: meta.contentType,
        sizeBytes: meta.sizeBytes,
      });
    }
  } catch {
    return {
      ok: false,
      error: `Failed to verify uploaded ${noun}. Please try again.`,
      status: 500,
    };
  }
  return { ok: true, images };
}

// Window during which the one-time claim_secret can attach an email to a fresh
// report. The secret is returned to the submitter's browser; only its hash is
// stored.
const CLAIM_TTL_MS = 60 * 60 * 1000; // 1 hour

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const [existing] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    suffix++;
  }
}

export async function POST(request: Request) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (await isRateLimited("reports", ip, 3, 60 * 60)) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      { status: 429 }
    );
  }

  let body: ReportBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  // Honeypot: a hidden field no human fills. If it's set, accept silently so the
  // bot believes it succeeded, but store nothing and issue no claim secret.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Bot check (a no-op until Turnstile keys are configured).
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Verification failed. Please complete the challenge and retry." },
      { status: 400 }
    );
  }

  // Truthfulness / terms acceptance is required — enforced here too so a direct
  // API caller can't bypass the form's checkbox.
  if (
    typeof body.terms_version !== "string" ||
    body.terms_version.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "You must accept the terms to submit a report." },
      { status: 400 }
    );
  }

  const validation = validateReportFields(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.errors.join(" ") },
      { status: 400 }
    );
  }
  const { quantity, totalPrice } = validation.values;

  // Verify evidence photos and (optional, private) order receipts. The endpoint
  // is public, so the client is not trusted: keys must be our own staging keys
  // and the objects must exist in R2 with an allowed type/size.
  const evidence = await verifyUploadBatch(
    body.images,
    PENDING_KEY_PATTERN,
    MAX_IMAGES_PER_REPORT,
    "photos",
    isAllowedImageType,
    MAX_IMAGE_BYTES,
  );
  if (!evidence.ok) {
    return NextResponse.json({ error: evidence.error }, { status: evidence.status });
  }
  const receipts = await verifyUploadBatch(
    body.receipts,
    RECEIPT_KEY_PATTERN,
    MAX_RECEIPTS_PER_REPORT,
    "receipts",
    isAllowedReceiptType,
    MAX_RECEIPT_BYTES,
  );
  if (!receipts.ok) {
    return NextResponse.json({ error: receipts.error }, { status: receipts.status });
  }

  // The order receipt is optional, but a report with no receipt must carry a
  // short reason — that note is the moderator's only basis to judge an
  // unverified report. Enforced here too so a direct API caller can't bypass
  // the form's gate. A receipt makes any supplied reason moot (stored as null).
  const rawNoReceiptReason =
    typeof body.no_receipt_reason === "string" ? body.no_receipt_reason.trim() : "";
  const hasReceipts = receipts.images.length > 0;
  if (!hasReceipts && rawNoReceiptReason.length < MIN_NO_RECEIPT_REASON) {
    return NextResponse.json(
      {
        error:
          "Attach an order receipt, or add a short note (a few words) explaining why you don't have one.",
      },
      { status: 400 },
    );
  }
  const noReceiptReason = hasReceipts
    ? null
    : rawNoReceiptReason.slice(0, MAX_NO_RECEIPT_REASON);

  try {
    const slug = await generateUniqueSlug(
      `${body.seller_name}-${body.product_name}`
    );

    // One-time secret handed back to the submitter's browser. Presenting it
    // (within CLAIM_TTL) lets them attach an email and receive a manage link.
    // Only its hash is persisted.
    const claimSecret = generateSecret();

    const [inserted] = await db
      .insert(reports)
      .values({
        platform: body.platform?.trim() || "alibaba",
        seller_name: body.seller_name.trim(),
        seller_url: body.seller_url.trim(),
        product_name: body.product_name.trim(),
        product_url:
          typeof body.product_url === "string" ? body.product_url.trim() : "",
        quantity: String(quantity),
        total_price: String(totalPrice),
        currency: body.currency.trim(),
        industry: body.industry.trim(),
        details: body.details.trim(),
        no_receipt_reason: noReceiptReason,
        status: "pending",
        slug,
        claim_secret_hash: hashToken(claimSecret),
        claim_expires_at: new Date(Date.now() + CLAIM_TTL_MS),
        terms_version: body.terms_version.trim(),
        terms_accepted_at: new Date(),
      })
      .returning({ id: reports.id });

    const allImages = [
      ...evidence.images.map((img, i) => ({ ...img, kind: "evidence" as const, position: i })),
      ...receipts.images.map((img, i) => ({ ...img, kind: "receipt" as const, position: i })),
    ];
    if (allImages.length > 0) {
      try {
        await db.insert(report_images).values(
          allImages.map((image) => ({
            report_id: inserted.id,
            storage_key: image.key,
            content_type: image.contentType,
            size_bytes: image.sizeBytes,
            position: image.position,
            kind: image.kind,
          }))
        );
      } catch (error) {
        // neon-http has no transactions — compensate so a failed image insert
        // doesn't strand a photo-less report behind a 500 (the reporter would
        // retry and create a duplicate).
        await db.delete(reports).where(eq(reports.id, inserted.id));
        throw error;
      }
    }

    // report_id + claim_secret let the success screen optionally attach an
    // email. The id is unguessable (uuid) and useless without the secret.
    return NextResponse.json(
      { ok: true, report_id: inserted.id, claim_secret: claimSecret },
      { status: 201 }
    );
  } catch {
    // Orphaned pending/ objects (report row failed, or image rows failed
    // after the report landed) are swept by the R2 lifecycle rule.
    return NextResponse.json(
      { error: "Failed to submit report." },
      { status: 500 }
    );
  }
}
