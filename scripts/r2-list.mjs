// Live view of the R2 bucket, split by lifecycle stage. Faster than the
// dashboard (which doesn't auto-refresh).
//
//   node scripts/r2-list.mjs         one-shot snapshot
//   node scripts/r2-list.mjs watch   refresh every 3s (Ctrl-C to stop)

import { config } from "dotenv";
config({ path: ".env.local" });

import {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const bucket = process.env.R2_BUCKET;
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

async function listPrefix(prefix) {
  const out = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
  );
  const rows = [];
  for (const o of out.Contents ?? []) {
    let ct = "?";
    try {
      const h = await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: o.Key }),
      );
      ct = h.ContentType ?? "?";
    } catch {
      /* ignore */
    }
    rows.push({ key: o.Key, size: o.Size ?? 0, ct, mtime: o.LastModified });
  }
  rows.sort((a, b) => (a.mtime < b.mtime ? -1 : 1));
  return rows;
}

function render(rows, label) {
  const totalKb = rows.reduce((s, r) => s + r.size, 0) / 1024;
  console.log(`\n${label} — ${rows.length} object(s), ${totalKb.toFixed(0)} KB total`);
  for (const r of rows) {
    console.log(
      `  ${(r.size / 1024).toFixed(0).padStart(5)} KB  ${r.ct.padEnd(11)}  ${r.key}`,
    );
  }
}

async function snapshot(clear) {
  const [pending, published] = await Promise.all([
    listPrefix("pending/"),
    listPrefix("reports/"),
  ]);
  if (clear) console.clear();
  render(pending, "PENDING  (uploaded, awaiting moderation)");
  render(published, "PUBLISHED  (live on report pages)");
}

const watch = process.argv.includes("watch");
await snapshot(false);
if (watch) {
  console.log("\nwatching every 3s… (Ctrl-C to stop)");
  setInterval(() => snapshot(true).catch((e) => console.error(e.message)), 3000);
}
