// Shared image-upload constants and helpers, safe for both client and server.

export const MAX_IMAGES_PER_REPORT = 5;

// Hard cap on a single uploaded image, enforced when presigning and re-verified
// against the stored object before a report is accepted. Client-side compression
// targets ~300 KB, so anything near this limit is suspicious but tolerated
// (e.g. a very large screenshot that compresses poorly).
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

// WebP is the target format; JPEG is the fallback for browsers that cannot
// encode WebP on canvas (Safari).
export const ALLOWED_IMAGE_TYPES = ["image/webp", "image/jpeg"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function isAllowedImageType(value: string): value is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value);
}

export function imageExtension(contentType: AllowedImageType): "webp" | "jpg" {
  return contentType === "image/webp" ? "webp" : "jpg";
}

// Unguessable staging key for not-yet-approved uploads. Objects here are never
// linked publicly and an R2 lifecycle rule cleans the prefix up after 7 days.
export const PENDING_KEY_PATTERN =
  /^pending\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|jpg)$/;

export function publicImageUrl(storageKey: string): string | null {
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/${storageKey}`;
}
