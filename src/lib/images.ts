// Shared image-upload constants and helpers, safe for both client and server.

export const MAX_IMAGES_PER_REPORT = 5;

// Order receipts are capped lower and kept in a separate, private prefix. They
// contain buyer PII, are never published, and only ever surface to admins via
// short-lived presigned URLs.
export const MAX_RECEIPTS_PER_REPORT = 2;

// Hard cap on a single uploaded image, enforced when presigning and re-verified
// against the stored object before a report is accepted. Client-side compression
// targets ~300 KB, so anything near this limit is suspicious but tolerated
// (e.g. a very large screenshot that compresses poorly).
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

// Receipts may be PDFs (common for platform order receipts/invoices), which we
// can't re-compress client-side, so they get a looser byte cap than images.
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

// WebP is the target format; JPEG is the fallback for browsers that cannot
// encode WebP on canvas (Safari).
export const ALLOWED_IMAGE_TYPES = ["image/webp", "image/jpeg"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// Receipts additionally allow PDF. PDFs are only ever accepted for the private
// receipts/ prefix — never for public evidence photos.
export const ALLOWED_RECEIPT_TYPES = [
  "image/webp",
  "image/jpeg",
  "application/pdf",
] as const;
export type AllowedReceiptType = (typeof ALLOWED_RECEIPT_TYPES)[number];

export function isAllowedImageType(value: string): value is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value);
}

export function isAllowedReceiptType(value: string): value is AllowedReceiptType {
  return (ALLOWED_RECEIPT_TYPES as readonly string[]).includes(value);
}

export function imageExtension(contentType: AllowedImageType): "webp" | "jpg" {
  return contentType === "image/webp" ? "webp" : "jpg";
}

export function receiptExtension(
  contentType: AllowedReceiptType,
): "webp" | "jpg" | "pdf" {
  if (contentType === "application/pdf") return "pdf";
  return contentType === "image/webp" ? "webp" : "jpg";
}

// Unguessable staging key for not-yet-approved uploads. Objects here are never
// linked publicly and an R2 lifecycle rule cleans the prefix up after 7 days.
export const PENDING_KEY_PATTERN =
  /^pending\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|jpg)$/;

// Private staging prefix for order receipts. Like pending/, never linked
// publicly; swept by the same R2 lifecycle rule if a report is never finished.
export const RECEIPT_KEY_PATTERN =
  /^receipts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|jpg|pdf)$/;

export function publicImageUrl(storageKey: string): string | null {
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/${storageKey}`;
}
