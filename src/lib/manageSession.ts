import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { hashToken } from "@/lib/tokens";

// HttpOnly cookie set by the /api/manage/[id]/enter route after a valid manage
// link is clicked. Holds the report id + raw manage token so the page and the
// mutation endpoints can re-authorize without the token ever sitting in a URL
// (which would leak via Referer to analytics / the image CDN). path="/" so it
// reaches both /manage/* (the page) and /api/manage/* (the mutations).
export const MANAGE_COOKIE = "manage_session";
export const MANAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

type ManageSession = { id: string; token: string };

export function parseManageCookie(raw: string | undefined): ManageSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: unknown; token?: unknown };
    if (typeof parsed.id === "string" && typeof parsed.token === "string") {
      return { id: parsed.id, token: parsed.token };
    }
  } catch {
    /* malformed cookie */
  }
  return null;
}

/**
 * Returns the full report row if the caller holds a valid manage session for
 * `reportId`, else null. The token is compared as a hash inside the SQL WHERE.
 * Used by both the manage page (render auth) and the mutation route handlers.
 */
export async function authorizeManage(reportId: string) {
  const store = await cookies();
  const session = parseManageCookie(store.get(MANAGE_COOKIE)?.value);
  if (!session || session.id !== reportId) return null;

  const [report] = await db
    .select()
    .from(reports)
    .where(
      and(
        eq(reports.id, reportId),
        eq(reports.manage_token_hash, hashToken(session.token)),
      ),
    )
    .limit(1);

  return report ?? null;
}
