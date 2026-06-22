import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { isRateLimited } from "@/lib/rateLimit";
import { generateSecret, hashToken } from "@/lib/tokens";
import { emailConfigured, sendManageLinkEmail, validEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";

// Attach an email to a freshly-submitted report and send its manage link.
// Requires the one-time claim_secret returned by POST /api/reports, so a
// stranger can't claim someone else's report.
export async function POST(request: Request) {
  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "Email isn't set up yet — please check back soon." },
      { status: 503 },
    );
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  let body: { report_id?: unknown; claim_secret?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const reportId = typeof body.report_id === "string" ? body.report_id : "";
  const claimSecret =
    typeof body.claim_secret === "string" ? body.claim_secret : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!reportId || !claimSecret || !email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!validEmail(email)) {
    return NextResponse.json(
      { error: "That doesn't look like a valid email address." },
      { status: 400 },
    );
  }

  // Limit by IP and by recipient address so this can't be used to spam an inbox.
  if (
    (await isRateLimited("email:attach", ip, 5, 60 * 60)) ||
    (await isRateLimited("email:to", email, 5, 60 * 60))
  ) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const manageToken = generateSecret();

  // Compare-and-swap: the WHERE checks the claim secret + expiry AND the SET
  // nulls the secret, so it's single-use and two racing requests can't both
  // attach an email. neon-http has no transactions — this conditional UPDATE is
  // the atomic guard.
  let updated;
  try {
    updated = await db
      .update(reports)
      .set({
        submitter_email: email,
        manage_token_hash: hashToken(manageToken),
        claim_secret_hash: null,
        claim_expires_at: null,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(reports.id, reportId),
          eq(reports.claim_secret_hash, hashToken(claimSecret)),
          gt(reports.claim_expires_at, new Date()),
        ),
      )
      .returning({ id: reports.id, seller_name: reports.seller_name });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  if (updated.length === 0) {
    // Wrong id/secret, or it expired / was already used. Generic message.
    return NextResponse.json(
      { error: "This link has expired. Your report was still submitted." },
      { status: 400 },
    );
  }

  // Email send happens after the claim is consumed. If it fails, the report is
  // already linked to this email — the /manage resend flow can re-issue a link.
  const manageUrl = absoluteUrl(
    `/api/manage/${reportId}/enter?token=${encodeURIComponent(manageToken)}`,
  );
  try {
    await sendManageLinkEmail({
      to: email,
      manageUrl,
      sellerName: updated[0].seller_name,
    });
  } catch (err) {
    console.error("attach: manage-link email send failed", err);
    return NextResponse.json(
      { error: "We couldn't send the email. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
