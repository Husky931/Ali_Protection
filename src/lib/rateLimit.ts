import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { rate_limits } from "@/lib/db/schema";

// Salt so the table stores a one-way hash of the IP/email, not the raw value
// (defensible under our own Privacy policy). Reuse an existing secret if a
// dedicated one isn't set.
const SALT = process.env.RATE_LIMIT_SALT ?? process.env.ADMIN_PASSWORD ?? "";

function hashId(id: string): string {
  return createHash("sha256").update(`${id}:${SALT}`).digest("hex").slice(0, 32);
}

/**
 * Persisted, fixed-window rate limit. Returns `true` if the caller is OVER the
 * limit for the current window (i.e. the request should be rejected).
 *
 * Replaces the old in-memory Map, which was per-lambda and reset on every cold
 * start. The increment is a single atomic upsert, so concurrent serverless
 * instances serialize on the primary-key conflict — no read-then-write race.
 *
 * @param scope     logical bucket, e.g. "reports" | "uploads" | "email:attach"
 * @param id        identity to limit on (IP address, or an email)
 * @param limit     max events allowed per window
 * @param windowSec window length in seconds
 */
export async function isRateLimited(
  scope: string,
  id: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / windowSec) * windowSec;
  const bucketKey = `${scope}:${hashId(id)}:${windowStart}`;
  const expiresAt = new Date((windowStart + windowSec) * 1000);

  try {
    const [row] = await db
      .insert(rate_limits)
      .values({ bucket_key: bucketKey, count: 1, expires_at: expiresAt })
      .onConflictDoUpdate({
        target: rate_limits.bucket_key,
        set: { count: sql`${rate_limits.count} + 1` },
      })
      .returning({ count: rate_limits.count });

    // Opportunistic cleanup (~1% of calls) so expired buckets don't accumulate;
    // avoids needing a cron just for this.
    if (now % 100 === 0) {
      await db.delete(rate_limits).where(sql`${rate_limits.expires_at} < now()`);
    }

    return (row?.count ?? 1) > limit;
  } catch {
    // Fail OPEN: a limiter hiccup must not take down submissions. Abuse is still
    // bounded by Turnstile + the honeypot.
    return false;
  }
}
