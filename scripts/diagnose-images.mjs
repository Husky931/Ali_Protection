// Cross-checks the DB against the R2 bucket to settle exactly where pending
// report photos live. For every report_images row, reports whether its object
// is actually present in the bucket.
//
//   node scripts/diagnose-images.mjs

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import {
  S3Client,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const sql = neon(process.env.DATABASE_URL);
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

async function objectExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// 1. Report counts by status, and total image rows.
const counts = await sql`SELECT status, count(*)::int AS n FROM reports GROUP BY status ORDER BY status`;
const [{ n: imageRows }] = await sql`SELECT count(*)::int AS n FROM report_images`;
console.log("\n=== DB report counts by status ===");
for (const c of counts) console.log(`  ${c.status.padEnd(10)} ${c.n}`);
console.log(`  report_images rows: ${imageRows}`);

// 2. Every image row, newest first, with bucket presence.
const rows = await sql`
  SELECT r.status, r.slug, ri.storage_key, ri.position, ri.size_bytes, r.created_at
  FROM reports r
  JOIN report_images ri ON ri.report_id = r.id
  ORDER BY r.created_at DESC, ri.position
`;

console.log("\n=== Each image row → is its object in the bucket? ===");
if (rows.length === 0) {
  console.log("  (no report_images rows at all)");
}
for (const row of rows) {
  const present = await objectExists(row.storage_key);
  const prefix = row.storage_key.startsWith("pending/")
    ? "PENDING"
    : row.storage_key.startsWith("reports/")
      ? "PUBLISHED"
      : "OTHER";
  console.log(
    `  [${row.status.padEnd(8)}] ${prefix.padEnd(9)} ${present ? "✓ in bucket" : "✗ MISSING  "}  ${row.storage_key}`,
  );
}

// 3. Raw bucket listing for cross-reference.
async function listKeys(prefix) {
  const out = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
  );
  return (out.Contents ?? []).map((o) => o.Key);
}
const pendingKeys = await listKeys("pending/");
const reportKeys = await listKeys("reports/");
console.log("\n=== Raw bucket contents ===");
console.log(`  pending/  : ${pendingKeys.length} object(s)`);
for (const k of pendingKeys) console.log(`     ${k}`);
console.log(`  reports/  : ${reportKeys.length} object(s)`);
for (const k of reportKeys) console.log(`     ${k}`);

console.log(
  "\nInterpretation: a row marked [pending] + PENDING + ✓ in bucket proves the\n" +
    "photo was uploaded at SUBMIT time, before any admin approval.\n",
);
