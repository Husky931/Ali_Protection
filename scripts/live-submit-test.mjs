// Drives the REAL app endpoints exactly as the browser does, and checks the
// bucket at each step WITHOUT ever approving. Proves where photos live during
// the pending phase. Cleans up the test report + object at the end.
//
//   (dev server must be running)  node scripts/live-submit-test.mjs
//   override target:              TEST_BASE_URL=https://alibabascammer.com node scripts/live-submit-test.mjs

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import {
  S3Client,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
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

const MARKER = "ZZZ-DIAGNOSTIC-DELETE-ME";

async function headExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

console.log(`\nTarget app: ${BASE}\n`);

// --- Step 1: presign via the real /api/uploads (what the browser calls first)
const body = Buffer.from("RIFF0000WEBPVP8 live-submit-test", "utf8");
const presignRes = await fetch(`${BASE}/api/uploads`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    files: [{ content_type: "image/webp", size_bytes: body.length }],
  }),
});
console.log(`1. POST /api/uploads → ${presignRes.status}`);
if (!presignRes.ok) {
  console.error("   body:", await presignRes.text());
  process.exit(1);
}
const { uploads } = await presignRes.json();
const key = uploads[0].key;
console.log(`   presigned key: ${key}`);

// --- Step 2: browser PUTs the bytes straight to R2
const putRes = await fetch(uploads[0].url, {
  method: "PUT",
  headers: { "Content-Type": "image/webp" },
  body,
});
console.log(`2. PUT bytes to R2 → ${putRes.status}`);

// --- Step 3: bucket check BEFORE the report row even exists, BEFORE approval
const existsAfterUpload = await headExists(key);
console.log(
  `\n   >>> CHECKPOINT A — right after upload, no report saved yet, no approval:\n` +
    `       object in pending/ ? ${existsAfterUpload ? "✓ YES" : "✗ NO"}\n`,
);

// --- Step 4: create the report via the real /api/reports
const reportRes = await fetch(`${BASE}/api/reports`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    seller_name: MARKER,
    seller_url: "https://example.com/diagnostic",
    product_name: "diagnostic image test",
    product_url: "",
    quantity: 1,
    total_price: 1,
    currency: "USD",
    industry: "Electronics",
    details:
      "Automated diagnostic submission to prove pending image storage. " +
      "Safe to delete. " .repeat(3),
    images: [key],
  }),
});
console.log(`3. POST /api/reports → ${reportRes.status}`);
if (!reportRes.ok) console.error("   body:", await reportRes.text());

// --- Step 5: inspect the DB row (status should be 'pending')
const [rep] = await sql`
  SELECT id, status, slug FROM reports
  WHERE seller_name = ${MARKER}
  ORDER BY created_at DESC LIMIT 1
`;
const imgs = rep
  ? await sql`SELECT storage_key, position FROM report_images WHERE report_id = ${rep.id} ORDER BY position`
  : [];
console.log(
  `   DB: status='${rep?.status}', image rows=${imgs.length}, key='${imgs[0]?.storage_key}'`,
);

// --- Step 6: bucket check WITH report saved, status=pending, STILL no approval
const existsPending = imgs[0] ? await headExists(imgs[0].storage_key) : false;
console.log(
  `\n   >>> CHECKPOINT B — report saved, status=PENDING, still NOT approved:\n` +
    `       object in pending/ ? ${existsPending ? "✓ YES" : "✗ NO"}\n`,
);

// --- Step 7: cleanup so nothing diagnostic lingers
if (rep) await sql`DELETE FROM reports WHERE id = ${rep.id}`;
if (imgs[0]) {
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: imgs[0].storage_key }),
  );
}
console.log("4. Cleaned up the diagnostic report + object.");

console.log(
  existsAfterUpload && existsPending
    ? "\nVERDICT: photos ARE in the bucket (pending/) at submit time, before any approval. ✓\n"
    : "\nVERDICT: pending object was NOT found — there is a real bug to investigate. ✗\n",
);
