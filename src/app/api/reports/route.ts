import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { reports, report_images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReportInsert } from "@/lib/reportTypes";
import { slugify } from "@/lib/slugify";
import {
  MAX_IMAGES_PER_REPORT,
  MAX_IMAGE_BYTES,
  PENDING_KEY_PATTERN,
  isAllowedImageType,
} from "@/lib/images";
import { headObject, deleteObjects, r2Configured } from "@/lib/r2";

// product_url is intentionally absent — the form labels it optional.
const requiredTextFields = [
  "seller_name",
  "seller_url",
  "product_name",
  "currency",
  "industry",
  "details",
];

// In-memory rate limiter: IP -> timestamps
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW
  );
  rateMap.set(ip, timestamps);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  return false;
}

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
  // Rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      { status: 429 }
    );
  }

  let body: ReportInsert;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const errors: string[] = [];

  for (const field of requiredTextFields) {
    const value = body[field as keyof ReportInsert];
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${field} is required.`);
    }
  }

  const quantity = Number(body.quantity);
  const totalPrice = Number(body.total_price);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push("quantity must be a positive number.");
  }

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    errors.push("total_price must be a positive number.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  // Validate evidence images: keys must be our own pending/ staging keys, and
  // the objects must actually exist in R2 with an allowed type and size (the
  // client is not trusted — it only ever sends keys it got from /api/uploads,
  // but anyone can call this endpoint directly).
  const imageKeys = Array.from(
    new Set(Array.isArray(body.images) ? body.images : [])
  );
  type VerifiedImage = { key: string; contentType: string; sizeBytes: number };
  const verifiedImages: VerifiedImage[] = [];

  if (imageKeys.length > 0) {
    if (!r2Configured()) {
      return NextResponse.json(
        { error: "Image uploads are not available right now." },
        { status: 400 }
      );
    }
    if (imageKeys.length > MAX_IMAGES_PER_REPORT) {
      return NextResponse.json(
        { error: `At most ${MAX_IMAGES_PER_REPORT} photos per report.` },
        { status: 400 }
      );
    }
    if (imageKeys.some((key) => typeof key !== "string" || !PENDING_KEY_PATTERN.test(key))) {
      return NextResponse.json(
        { error: "Invalid image reference." },
        { status: 400 }
      );
    }

    try {
      for (const key of imageKeys) {
        const meta = await headObject(key);
        if (
          !meta ||
          !isAllowedImageType(meta.contentType) ||
          meta.sizeBytes <= 0 ||
          meta.sizeBytes > MAX_IMAGE_BYTES
        ) {
          // Don't publish anything we can't vouch for; drop the whole batch.
          await deleteObjects(imageKeys);
          return NextResponse.json(
            { error: "One or more photos could not be verified. Please re-attach them and try again." },
            { status: 400 }
          );
        }
        verifiedImages.push({
          key,
          contentType: meta.contentType,
          sizeBytes: meta.sizeBytes,
        });
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to verify uploaded photos. Please try again." },
        { status: 500 }
      );
    }
  }

  try {
    const slug = await generateUniqueSlug(
      `${body.seller_name}-${body.product_name}`
    );

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
        status: "pending",
        slug,
      })
      .returning({ id: reports.id });

    if (verifiedImages.length > 0) {
      try {
        await db.insert(report_images).values(
          verifiedImages.map((image, position) => ({
            report_id: inserted.id,
            storage_key: image.key,
            content_type: image.contentType,
            size_bytes: image.sizeBytes,
            position,
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
  } catch {
    // Orphaned pending/ objects (report row failed, or image rows failed
    // after the report landed) are swept by the R2 lifecycle rule.
    return NextResponse.json(
      { error: "Failed to submit report." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
