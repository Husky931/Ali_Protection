import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReportInsert } from "@/lib/reportTypes";
import { slugify } from "@/lib/slugify";

const requiredTextFields = [
  "seller_name",
  "seller_url",
  "product_name",
  "product_url",
  "currency",
  "industry",
  "details",
];

// In-memory rate limiter: IP -> timestamps
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 3;
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

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const [existing] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    suffix++;
  }
}

export async function POST(request: Request) {
  // Rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      { status: 429 }
    );
  }

  let body: ReportInsert;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const errors: string[] = [];

  for (const field of requiredTextFields) {
    const value = body[field as keyof ReportInsert];
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${field} is required.`);
    }
  }

  const quantity = Number(body.quantity);
  const totalPrice = Number(body.total_price);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push("quantity must be a positive number.");
  }

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    errors.push("total_price must be a positive number.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  try {
    const slug = await generateUniqueSlug(
      `${body.seller_name}-${body.product_name}`
    );

    await db.insert(reports).values({
      platform: body.platform?.trim() || "alibaba",
      seller_name: body.seller_name.trim(),
      seller_url: body.seller_url.trim(),
      product_name: body.product_name.trim(),
      product_url: body.product_url.trim(),
      quantity: String(quantity),
      total_price: String(totalPrice),
      currency: body.currency.trim(),
      industry: body.industry.trim(),
      details: body.details.trim(),
      status: "pending",
      slug,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit report." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
