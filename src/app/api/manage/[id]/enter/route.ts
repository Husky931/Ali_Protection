import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { hashToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/site";
import { MANAGE_COOKIE, MANAGE_COOKIE_MAX_AGE } from "@/lib/manageSession";

// Entry point for the emailed manage link. Validates the token (in the URL),
// drops it into an HttpOnly cookie, and redirects to the clean /manage/[id] URL
// so the token never lingers in history / Referer. This is the only place the
// token appears in a URL.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token") ?? "";

  let valid = false;
  if (token) {
    const [report] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(
        and(
          eq(reports.id, id),
          eq(reports.manage_token_hash, hashToken(token)),
        ),
      )
      .limit(1);
    if (report) {
      valid = true;
      // First successful click is proof the submitter controls the email.
      await db
        .update(reports)
        .set({ email_verified: true })
        .where(eq(reports.id, id));
    }
  }

  if (!valid) {
    return NextResponse.redirect(absoluteUrl("/manage?error=invalid"));
  }

  const res = NextResponse.redirect(absoluteUrl(`/manage/${id}`));
  res.cookies.set(MANAGE_COOKIE, JSON.stringify({ id, token }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MANAGE_COOKIE_MAX_AGE,
  });
  return res;
}
