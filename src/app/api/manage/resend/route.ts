import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, desc, isNotNull, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { isRateLimited } from "@/lib/rateLimit";
import { generateSecret, hashToken } from "@/lib/tokens";
import { emailConfigured, sendManageLinkEmail, validEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";

// "Email me my manage link again." Always returns a generic success so the
// endpoint can't be used to discover which emails are on file. Because we only
// store the token hash, we rotate the token and email the new link (the old
// emailed link stops working, which is fine — they lost it).
export async function POST(request: Request) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (validEmail(email) && emailConfigured()) {
    const ipLimited = await isRateLimited("email:resend", ip, 5, 60 * 60);
    const emailLimited = await isRateLimited("email:to", email, 5, 60 * 60);
    if (!ipLimited && !emailLimited) {
      const [report] = await db
        .select({ id: reports.id, seller_name: reports.seller_name })
        .from(reports)
        .where(
          and(
            eq(reports.submitter_email, email),
            isNotNull(reports.manage_token_hash),
            inArray(reports.status, ["pending", "approved"]),
          ),
        )
        .orderBy(desc(reports.created_at))
        .limit(1);

      if (report) {
        const newToken = generateSecret();
        await db
          .update(reports)
          .set({ manage_token_hash: hashToken(newToken), email_verified: true })
          .where(eq(reports.id, report.id));
        const url = absoluteUrl(
          `/api/manage/${report.id}/enter?token=${encodeURIComponent(newToken)}`,
        );
        try {
          await sendManageLinkEmail({
            to: email,
            manageUrl: url,
            sellerName: report.seller_name,
          });
        } catch {
          /* swallow — generic response below */
        }
      }
    }
  }

  // Always generic — no account enumeration.
  return NextResponse.json({ ok: true });
}
