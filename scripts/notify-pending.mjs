// Daily "pending reports" notifier.
//
// Checks the Neon DB for reports awaiting moderation and pings you on Telegram.
// Designed to be run by launchd once a day, but you can also run it by hand:
//
//   node scripts/notify-pending.mjs            normal run (notify only if pending > 0)
//   node scripts/notify-pending.mjs --test     send a test message regardless of count
//   node scripts/notify-pending.mjs --chat-id  print chat IDs from recent bot messages (setup helper)
//
// Env (loaded from .env.local then .env at the project root):
//   DATABASE_URL          required — same Neon URL the app uses
//   TELEGRAM_BOT_TOKEN    required — from @BotFather
//   TELEGRAM_CHAT_ID      required — your chat id (use --chat-id to find it)
//   NEXT_PUBLIC_SITE_URL  optional — used for the /admin review link (default https://alibabascammer.com)
//   NOTIFY_WHEN_EMPTY     optional — set to 1 to also get a daily "all clear" message

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(root, ".env.local") });
config({ path: join(root, ".env") });

const args = process.argv.slice(2);
const isTest = args.includes("--test");
const wantChatId = args.includes("--chat-id");

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

function die(msg) {
  console.error(msg);
  process.exit(1);
}

async function telegram(method, payload) {
  if (!token) die("TELEGRAM_BOT_TOKEN is not set. Add it to .env.local.");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) die(`Telegram API error (${method}): ${JSON.stringify(data)}`);
  return data.result;
}

// Setup helper: message your bot once, then run this to discover your chat id.
if (wantChatId) {
  if (!token) die("TELEGRAM_BOT_TOKEN is not set. Add it to .env.local first.");
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = await res.json();
  if (!data.ok) die(`Telegram API error: ${JSON.stringify(data)}`);
  if (!data.result.length) {
    die("No messages yet. Open your bot in Telegram, send it any message, then re-run this.");
  }
  const chats = new Map();
  for (const u of data.result) {
    const c = u.message?.chat;
    if (c) chats.set(c.id, `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.title || c.username || "");
  }
  console.log("Chat IDs found (put the right one in TELEGRAM_CHAT_ID):");
  for (const [id, who] of chats) console.log(`  ${id}  ${who}`);
  process.exit(0);
}

if (!process.env.DATABASE_URL) die("DATABASE_URL is not set.");
if (!chatId && !isTest) die("TELEGRAM_CHAT_ID is not set. Run with --chat-id to find it.");

const sql = neon(process.env.DATABASE_URL);
const pending = await sql`
  SELECT seller_name, product_name, created_at
  FROM reports
  WHERE status = 'pending'
  ORDER BY created_at DESC
`;

const count = pending.length;
const adminUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://alibabascammer.com").replace(/\/$/, "") + "/admin";

let text;
if (isTest) {
  text = `✅ Test message from your Alibaba Scammers notifier.\n${count} report${count === 1 ? "" : "s"} currently pending.\nReview: ${adminUrl}`;
} else if (count === 0) {
  if (!process.env.NOTIFY_WHEN_EMPTY) {
    console.log("No pending reports — staying quiet.");
    process.exit(0);
  }
  text = `✅ No reports pending review.`;
} else {
  const shown = pending.slice(0, 10).map((r) => `• ${r.seller_name} — ${r.product_name}`);
  const more = count > 10 ? `\n…and ${count - 10} more` : "";
  text = `🔔 ${count} report${count === 1 ? "" : "s"} pending review\n\n${shown.join("\n")}${more}\n\nReview & approve: ${adminUrl}`;
}

await telegram("sendMessage", { chat_id: chatId, text, disable_web_page_preview: true });
console.log(`Sent Telegram notification (${count} pending).`);
