import { createHash, timingSafeEqual } from "node:crypto";

const adminPassword = process.env.ADMIN_PASSWORD;

/**
 * Admin auth for the moderation API: a shared secret passed in the
 * `x-admin-password` header. No cookies/sessions, so this is not CSRF-exposed —
 * a custom header can't be set cross-site without a CORS preflight our
 * same-origin API never grants.
 *
 * Both sides are hashed to a fixed 32 bytes and compared in constant time, so a
 * wrong guess can't be tuned via response-timing or length differences.
 */
export function isAuthorized(request: Request): boolean {
  if (!adminPassword) return false;
  const header = request.headers.get("x-admin-password");
  if (!header) return false;
  const a = createHash("sha256").update(header).digest();
  const b = createHash("sha256").update(adminPassword).digest();
  return timingSafeEqual(a, b);
}
