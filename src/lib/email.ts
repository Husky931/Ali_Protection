// Transactional email via the Resend REST API (no SDK — a plain fetch, matching
// the repo's fetch-based Telegram notifier). Until RESEND_API_KEY + EMAIL_FROM
// are configured, emailConfigured() is false and callers degrade gracefully.

// Trim whitespace and strip a single pair of matching wrapping quotes. Vercel's
// env UI stores values literally, so a value copied from a dotenv file (where
// quotes are syntax, not data) arrives as `'Name <a@b.com>'` — which Resend
// rejects as an invalid `from`. Only a matched outer pair is removed, so a
// legitimate `"Display Name" <a@b.com>` (ends in `>`, not a quote) is untouched.
function cleanEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  const first = trimmed[0];
  if (
    trimmed.length >= 2 &&
    (first === '"' || first === "'") &&
    trimmed[trimmed.length - 1] === first
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

const RESEND_API_KEY = cleanEnv(process.env.RESEND_API_KEY);
const EMAIL_FROM = cleanEnv(process.env.EMAIL_FROM);

export function emailConfigured(): boolean {
  return Boolean(RESEND_API_KEY && EMAIL_FROM);
}

export function validEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  if (!emailConfigured()) {
    throw new Error("Email is not configured (RESEND_API_KEY / EMAIL_FROM).");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${detail}`);
  }
}

function layout(bodyHtml: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.55;font-size:15px">${bodyHtml}<hr style="border:none;border-top:1px solid #eee;margin:28px 0 14px"/><p style="font-size:12px;color:#888">Alibaba Scammer — a community wall of fraud reports. You're receiving this because someone used this address on a report submission. If that wasn't you, ignore this email and nothing happens.</p></div>`;
}

export async function sendManageLinkEmail(opts: {
  to: string;
  manageUrl: string;
  sellerName: string;
}): Promise<void> {
  const { to, manageUrl, sellerName } = opts;
  const subject = "Your private link to manage your report";
  const text = `Thanks for submitting your report about "${sellerName}".

Use this private link to update or delete your report at any time:
${manageUrl}

Keep it private — anyone with this link can edit your report. If you didn't submit a report, you can ignore this email.`;
  const html = layout(
    `<h1 style="font-size:20px;margin:0 0 12px">Manage your report</h1>
     <p>Thanks for submitting your report about <strong>${escapeHtml(sellerName)}</strong>. A moderator will review it within 48 hours.</p>
     <p>Use this private link to update or delete your report at any time:</p>
     <p style="margin:22px 0"><a href="${manageUrl}" style="background:#c0322a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">Manage your report</a></p>
     <p style="font-size:13px;color:#666">Keep this link private — anyone who has it can edit your report.</p>`,
  );
  await sendEmail({ to, subject, html, text });
}

export async function sendReportStatusEmail(opts: {
  to: string;
  sellerName: string;
  decision: "approved" | "rejected";
  url: string;
}): Promise<void> {
  const { to, sellerName, decision, url } = opts;
  const approved = decision === "approved";
  const subject = approved
    ? "Your report is now live"
    : "Update on your report";
  const text = approved
    ? `Your report about "${sellerName}" passed review and is now public:\n${url}`
    : `After review, we weren't able to publish your report about "${sellerName}". This usually means we couldn't verify enough of the details. You're welcome to submit again with more specifics.`;
  const html = layout(
    approved
      ? `<h1 style="font-size:20px;margin:0 0 12px">It's live</h1>
         <p>Your report about <strong>${escapeHtml(sellerName)}</strong> passed review and is now public.</p>
         <p style="margin:22px 0"><a href="${url}" style="background:#c0322a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">View your report</a></p>`
      : `<h1 style="font-size:20px;margin:0 0 12px">Update on your report</h1>
         <p>After review, we weren't able to publish your report about <strong>${escapeHtml(sellerName)}</strong>. This usually means we couldn't verify enough of the details.</p>
         <p>You're welcome to submit again with more specifics.</p>`,
  );
  await sendEmail({ to, subject, html, text });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
