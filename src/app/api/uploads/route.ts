import { NextResponse } from "next/server";
import { headers } from "next/headers";

import {
  MAX_IMAGES_PER_REPORT,
  MAX_RECEIPTS_PER_REPORT,
  MAX_IMAGE_BYTES,
  MAX_RECEIPT_BYTES,
  isAllowedImageType,
  isAllowedReceiptType,
  imageExtension,
  receiptExtension,
  type AllowedReceiptType,
} from "@/lib/images";
import { presignUpload, r2Configured } from "@/lib/r2";
import { isRateLimited } from "@/lib/rateLimit";

// Upload limit is looser than report submission (3/hour) so a failed upload can
// be retried, but still bounded: worst case 10 requests x 5 files x 4 MB lands
// 200 MB/hour in pending/, which the R2 lifecycle rule cleans up.
type UploadRequest = {
  // "receipt" routes uploads to the private receipts/ prefix; anything else
  // (default) is evidence in pending/.
  kind?: unknown;
  files?: { content_type?: unknown; size_bytes?: unknown }[];
};

export async function POST(request: Request) {
  if (!r2Configured()) {
    return NextResponse.json(
      { error: "Image uploads are not available right now." },
      { status: 503 }
    );
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (await isRateLimited("uploads", ip, 10, 60 * 60)) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: UploadRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const isReceipt = body.kind === "receipt";
  const prefix = isReceipt ? "receipts" : "pending";
  const maxFiles = isReceipt ? MAX_RECEIPTS_PER_REPORT : MAX_IMAGES_PER_REPORT;
  // Receipts additionally accept PDF and get a looser byte cap.
  const typeAllowed = isReceipt ? isAllowedReceiptType : isAllowedImageType;
  const maxBytes = isReceipt ? MAX_RECEIPT_BYTES : MAX_IMAGE_BYTES;

  const files = body.files;
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "files is required." }, { status: 400 });
  }
  if (files.length > maxFiles) {
    return NextResponse.json(
      { error: `At most ${maxFiles} files per request.` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (
      typeof file?.content_type !== "string" ||
      !typeAllowed(file.content_type)
    ) {
      return NextResponse.json(
        {
          error: isReceipt
            ? "Receipts must be a WebP/JPEG image or a PDF."
            : "Only WebP or JPEG images are accepted.",
        },
        { status: 400 }
      );
    }
    if (
      typeof file.size_bytes !== "number" ||
      !Number.isInteger(file.size_bytes) ||
      file.size_bytes <= 0 ||
      file.size_bytes > maxBytes
    ) {
      return NextResponse.json(
        {
          error: isReceipt
            ? "Each receipt must be under 10 MB."
            : "Each photo must be under 4 MB.",
        },
        { status: 400 }
      );
    }
  }

  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const contentType = file.content_type as AllowedReceiptType;
        const sizeBytes = file.size_bytes as number;
        const ext = isReceipt
          ? receiptExtension(contentType)
          : imageExtension(contentType as "image/webp" | "image/jpeg");
        const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
        const url = await presignUpload(key, contentType, sizeBytes);
        return { key, url };
      })
    );
    return NextResponse.json({ uploads }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to prepare upload." },
      { status: 500 }
    );
  }
}
