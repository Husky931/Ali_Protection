// Server-only Cloudflare R2 access via the S3-compatible API.
// Required env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_URL_TTL_SECONDS = 10 * 60;
const VIEW_URL_TTL_SECONDS = 60 * 60;

let client: S3Client | null = null;

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

function bucket(): string {
  return process.env.R2_BUCKET!;
}

function getClient(): S3Client {
  if (!r2Configured()) {
    throw new Error("R2 is not configured (missing R2_* environment variables).");
  }
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      // R2 rejects the CRC32 checksum headers that aws-sdk >=3.729 adds by
      // default; Cloudflare's docs require WHEN_REQUIRED for both directions.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

// Presigned PUT. ContentType/ContentLength are passed to the signer, but do
// not rely on them being enforced — the authoritative checks are the
// HeadObject verification at submission and the forced Content-Type at
// publish (copyObject).
export async function presignUpload(
  key: string,
  contentType: string,
  sizeBytes: number,
): Promise<string> {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
      ContentLength: sizeBytes,
    }),
    { expiresIn: UPLOAD_URL_TTL_SECONDS },
  );
}

// Presigned GET for the admin queue — pending objects are not publicly served.
export async function presignView(key: string): Promise<string> {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
    { expiresIn: VIEW_URL_TTL_SECONDS },
  );
}

export async function headObject(
  key: string,
): Promise<{ sizeBytes: number; contentType: string } | null> {
  try {
    const result = await getClient().send(
      new HeadObjectCommand({ Bucket: bucket(), Key: key }),
    );
    return {
      sizeBytes: result.ContentLength ?? 0,
      contentType: result.ContentType ?? "application/octet-stream",
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "NotFound" || error.name === "NoSuchKey")
    ) {
      return null;
    }
    throw error;
  }
}

export function isMissingObjectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "NoSuchKey" ||
      error.name === "NotFound" ||
      (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === 404)
  );
}

export async function copyObject(
  sourceKey: string,
  destKey: string,
  contentType: string,
): Promise<void> {
  await getClient().send(
    new CopyObjectCommand({
      Bucket: bucket(),
      CopySource: `${bucket()}/${encodeURIComponent(sourceKey).replace(/%2F/g, "/")}`,
      Key: destKey,
      // Force the content type that was verified at submission instead of
      // whatever is on the staged object — a presigned PUT URL stays usable
      // for its whole TTL, so the object could have been re-uploaded with a
      // different type after verification. Publishing with image/* keeps a
      // swapped body inert in the browser.
      MetadataDirective: "REPLACE",
      ContentType: contentType,
    }),
  );
}

// Best-effort batch delete; failures are tolerated because the R2 lifecycle
// rule on pending/ eventually removes stragglers.
export async function deleteObjects(keys: string[]): Promise<void> {
  await Promise.allSettled(
    keys.map((key) =>
      getClient().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key })),
    ),
  );
}
