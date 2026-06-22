// Client-side image preparation: downscale, re-encode as WebP (JPEG fallback
// for browsers that can't encode WebP on canvas — Safari), strip metadata.
//
// The canvas round-trip is what guarantees EXIF/GPS data never leaves the
// reporter's device — important for a site promising anonymous reports.

import { heicTo, isHeic } from "heic-to";
import {
  MAX_IMAGE_BYTES,
  MAX_RECEIPT_BYTES,
  isAllowedImageType,
  type AllowedImageType,
  type AllowedReceiptType,
} from "@/lib/images";

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.8;
const JPEG_QUALITY = 0.82;
// Lower-quality retry if the first encode lands over MAX_IMAGE_BYTES.
const RETRY_QUALITY = 0.6;

// Pre-compression cap — just a sanity bound so we don't try to decode
// something absurd (the output is what actually gets size-enforced).
export const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

export type PreparedImage = {
  id: string;
  blob: Blob;
  contentType: AllowedImageType;
  previewUrl: string;
};

type DecodedImage = ImageBitmap | HTMLImageElement;

// iPhones default to HEIC, which only Safari can decode natively — Chrome,
// Firefox and Edge throw on it. Detect it by magic bytes (extension/MIME are
// unreliable) and transcode to JPEG via a WASM build of libheif before the
// rest of the pipeline. The heavy WASM only loads when an actual HEIC appears.
async function toDecodableBlob(file: File): Promise<Blob> {
  let heic = false;
  try {
    heic = await isHeic(file);
  } catch {
    heic = false;
  }
  if (!heic) return file;
  return heicTo({ blob: file, type: "image/jpeg", quality: 0.92 });
}

async function decodeImage(file: Blob): Promise<DecodedImage> {
  // createImageBitmap applies EXIF orientation; older Safari throws on the
  // options bag, very old browsers lack the API entirely.
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    /* fall through */
  }
  try {
    return await createImageBitmap(file);
  } catch {
    /* fall through */
  }
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable image"));
    };
    img.src = url;
  });
}

function encode(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("That image is over 30 MB. Please pick a smaller one.");
  }

  let source: DecodedImage;
  try {
    source = await decodeImage(await toDecodableBlob(file));
  } catch {
    throw new Error(
      "Couldn't read that image. Try a JPEG, PNG, or screenshot instead.",
    );
  }

  const sourceWidth =
    source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const sourceHeight =
    source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("Couldn't read that image. Try a different file.");
  }
  // Pixel-count guard, separate from the byte cap: a small file can decode to
  // an enormous bitmap and OOM mobile Safari, taking the whole form with it.
  if (sourceWidth * sourceHeight > 50_000_000) {
    if ("close" in source) source.close();
    throw new Error("That image has too many pixels. Try a smaller photo or a screenshot.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Your browser couldn't process this image.");
  }
  // Flatten transparency (e.g. PNG screenshots) onto white so JPEG fallback
  // doesn't render transparent areas as black.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source) source.close();

  // Prefer WebP; Safari silently returns a PNG (or null) when it can't encode
  // WebP, so check the actual output type before trusting it.
  let blob = await encode(canvas, "image/webp", WEBP_QUALITY);
  if (!blob || blob.type !== "image/webp") {
    blob = await encode(canvas, "image/jpeg", JPEG_QUALITY);
  }
  if (blob && blob.size > MAX_IMAGE_BYTES) {
    blob = await encode(canvas, blob.type, RETRY_QUALITY);
  }
  if (!blob || !isAllowedImageType(blob.type)) {
    throw new Error("Your browser couldn't process this image.");
  }
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error("That image couldn't be compressed under 4 MB.");
  }

  return {
    id: crypto.randomUUID(),
    blob,
    contentType: blob.type,
    previewUrl: URL.createObjectURL(blob),
  };
}

// A prepared order receipt: either a processed image (same pipeline as evidence)
// or a PDF passed through untouched. Receipts are private (admin-only), so PDFs
// are accepted as-is — we can't canvas-strip metadata from a PDF, and there's
// no public exposure to harden against.
export type PreparedReceipt = {
  id: string;
  blob: Blob;
  contentType: AllowedReceiptType;
  previewUrl: string;
  isPdf: boolean;
  fileName: string;
};

export async function prepareReceipt(file: File): Promise<PreparedReceipt> {
  const isPdf =
    file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  if (isPdf) {
    if (file.size > MAX_RECEIPT_BYTES) {
      throw new Error("That PDF is over 10 MB. Please upload a smaller file.");
    }
    if (file.size <= 0) {
      throw new Error("That file looks empty. Try a different one.");
    }
    return {
      id: crypto.randomUUID(),
      blob: file,
      contentType: "application/pdf",
      previewUrl: URL.createObjectURL(file),
      isPdf: true,
      fileName: file.name || "receipt.pdf",
    };
  }

  const image = await prepareImage(file);
  return { ...image, isPdf: false, fileName: file.name || "receipt" };
}
