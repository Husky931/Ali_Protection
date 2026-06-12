import { NextResponse } from "next/server";
import { headers } from "next/headers";

import {
  MAX_IMAGES_PER_REPORT,
  MAX_IMAGE_BYTES,
  isAllowedImageType,
  imageExtension,
} from "@/lib/images";
import { presignUpload, r2Configured } from "@/lib/r2";

// In-memory rate limiter: IP -> timestamps. Looser than report submission
// (3/hour) so a failed upload can be retried, but still bounded: worst case
// 10 requests x 5 files x 4 MB lands 200 MB/hour in pending/, which the R2
// lifecycle rule cleans up.
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW
  );
  rateMap.set(ip, timestamps);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  return false;
}

type UploadRequest = {
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

  if (isRateLimited(ip)) {
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

  const files = body.files;
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "files is required." }, { status: 400 });
  }
  if (files.length > MAX_IMAGES_PER_REPORT) {
    return NextResponse.json(
      { error: `At most ${MAX_IMAGES_PER_REPORT} photos per report.` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (
      typeof file?.content_type !== "string" ||
      !isAllowedImageType(file.content_type)
    ) {
      return NextResponse.json(
        { error: "Only WebP or JPEG images are accepted." },
        { status: 400 }
      );
    }
    if (
      typeof file.size_bytes !== "number" ||
      !Number.isInteger(file.size_bytes) ||
      file.size_bytes <= 0 ||
      file.size_bytes > MAX_IMAGE_BYTES
    ) {
      return NextResponse.json(
        { error: "Each photo must be under 4 MB." },
        { status: 400 }
      );
    }
  }

  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const contentType = file.content_type as "image/webp" | "image/jpeg";
        const sizeBytes = file.size_bytes as number;
        const key = `pending/${crypto.randomUUID()}.${imageExtension(contentType)}`;
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
