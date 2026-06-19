// Cloudflare Turnstile server-side verification. No SDK — a plain fetch to
// siteverify. Until both keys are configured this is a no-op (verifyTurnstile
// returns true), so the rest of the abuse hardening ships before the owner sets
// up the widget. Once keys exist, a missing/invalid token is rejected.

const SECRET = process.env.TURNSTILE_SECRET_KEY;
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileConfigured(): boolean {
  return Boolean(SECRET && SITE_KEY);
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<boolean> {
  // Not enforced until both keys are present.
  if (!turnstileConfigured()) return true;
  if (!token) return false;

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: SECRET!,
        response: token,
        remoteip: ip,
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Fail closed: if we can't verify while enforcement is on, reject.
    return false;
  }
}
