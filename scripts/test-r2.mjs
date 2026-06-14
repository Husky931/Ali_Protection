// End-to-end R2 pipeline check. Exercises the exact path the app uses:
// presigned PUT (browser upload) -> HeadObject (submit verification) ->
// CopyObject with forced content-type (admin publish) -> public GET via the
// custom domain (what report-page visitors hit) -> delete (cleanup).
//
// Usage: node scripts/test-r2.mjs   (loads .env.local automatically)
// Never prints secrets.

import { config } from "dotenv";
config({ path: ".env.local" });

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const required = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("\n✗ Missing required env vars:", missing.join(", "));
  console.error(
    "\n  R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY come from creating an R2 API\n" +
      "  token: Cloudflare → R2 → Manage R2 API Tokens → Create (Object Read &\n" +
      "  Write, scoped to your bucket). The secret is shown only once.\n",
  );
  process.exit(1);
}

const bucket = process.env.R2_BUCKET;
const publicBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

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

const stamp = Date.now();
const pendingKey = `pending/test-${stamp}.webp`;
const publicKey = `reports/test-${stamp}/0.webp`;
const contentType = "image/webp";
const body = Buffer.from("RIFF0000WEBPVP8 r2-pipeline-test", "utf8");

let failed = false;
const ok = (m) => console.log("✓", m);
const bad = (m, e) => {
  failed = true;
  console.error("✗", m);
  if (e) console.error("   ", e.name ? `${e.name}: ${e.message}` : e.message || e);
};

console.log(`\nBucket: ${bucket}  |  Public base: ${publicBase || "(NEXT_PUBLIC_IMAGE_BASE_URL not set)"}\n`);

// 1. Presigned PUT — the browser's upload path.
let putOk = false;
try {
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: pendingKey,
      ContentType: contentType,
      ContentLength: body.length,
    }),
    { expiresIn: 600 },
  );
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body,
  });
  if (!res.ok) throw new Error(`PUT returned ${res.status} ${res.statusText}`);
  putOk = true;
  ok(`presigned PUT upload → ${pendingKey}`);
} catch (e) {
  bad("presigned PUT upload failed — check the access key/secret and that the token has Object Write on this bucket", e);
}

// 2. HeadObject — submission-time verification.
if (putOk) {
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: pendingKey }),
    );
    if (head.ContentType !== contentType)
      throw new Error(`content-type is ${head.ContentType}, expected ${contentType}`);
    ok(`HeadObject verified (${head.ContentLength} bytes, ${head.ContentType})`);
  } catch (e) {
    bad("HeadObject failed", e);
  }

  // 3. CopyObject with forced content-type — the admin publish step.
  try {
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${encodeURIComponent(pendingKey).replace(/%2F/g, "/")}`,
        Key: publicKey,
        MetadataDirective: "REPLACE",
        ContentType: contentType,
      }),
    );
    ok(`CopyObject published → ${publicKey}`);
  } catch (e) {
    bad("CopyObject failed", e);
  }
}

// 4. Public GET via the custom domain — what a report-page visitor loads.
if (publicBase && putOk) {
  try {
    const url = `${publicBase.replace(/\/+$/, "")}/${publicKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 200) {
      ok(`public GET via custom domain (200, content-type: ${res.headers.get("content-type")})`);
    } else if (res.status === 404) {
      bad(
        `public GET returned 404 — the object exists in the bucket but the custom domain isn't serving it.\n   ` +
          `Enable public access: R2 → bucket → Settings → connect the custom domain (Public access via custom domain).`,
      );
    } else {
      bad(`public GET returned ${res.status} ${res.statusText}`);
    }
  } catch (e) {
    bad("public GET failed (DNS / custom domain not reachable)", e);
  }
} else if (!publicBase) {
  console.log("• skipped public GET (set NEXT_PUBLIC_IMAGE_BASE_URL to test it)");
}

// 5. Cleanup.
try {
  await Promise.allSettled([
    client.send(new DeleteObjectCommand({ Bucket: bucket, Key: pendingKey })),
    client.send(new DeleteObjectCommand({ Bucket: bucket, Key: publicKey })),
  ]);
  ok("cleanup (deleted both test objects)");
} catch (e) {
  bad("cleanup failed (harmless — lifecycle rule will sweep these)", e);
}

console.log(
  failed
    ? "\n✗ Some checks failed — see above.\n"
    : "\n✓ All checks passed. The R2 pipeline is fully working.\n",
);
process.exit(failed ? 1 : 0);
