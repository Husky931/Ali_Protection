import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports, report_images } from "@/lib/db/schema";
import { ReportInsert } from "@/lib/reportTypes";
import { validateReportFields } from "@/lib/validateReport";
import { authorizeManage } from "@/lib/manageSession";
import { deleteObjects, r2Configured } from "@/lib/r2";

// CSRF defense-in-depth: the auth cookie is SameSite=Lax (never sent on
// cross-site writes), and we additionally require a JSON content type, which a
// cross-site HTML form cannot set without a CORS preflight we don't grant.
function isJson(request: Request): boolean {
  return (request.headers.get("content-type") ?? "").includes("application/json");
}

// Edit a still-pending report. Once approved, the text is locked — this path
// re-reads status and refuses, so "submit benign → approve → smear" is
// impossible. Pending edits are re-validated exactly like a fresh submission.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isJson(request)) {
    return NextResponse.json({ error: "Unsupported content type." }, { status: 415 });
  }

  const report = await authorizeManage(id);
  if (!report) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (report.status !== "pending") {
    return NextResponse.json(
      { error: "This report has been published and can no longer be edited. You can add an update or take it down instead." },
      { status: 409 },
    );
  }

  let body: Partial<ReportInsert>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validateReportFields(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
  }
  const { quantity, totalPrice } = validation.values;

  // Compare-and-swap on status so a concurrent approval can't be clobbered.
  const updated = await db
    .update(reports)
    .set({
      platform: body.platform?.trim() || "alibaba",
      seller_name: body.seller_name!.trim(),
      seller_url: body.seller_url!.trim(),
      product_name: body.product_name!.trim(),
      product_url:
        typeof body.product_url === "string" ? body.product_url.trim() : "",
      quantity: String(quantity),
      total_price: String(totalPrice),
      currency: body.currency!.trim(),
      industry: body.industry!.trim(),
      details: body.details!.trim(),
      updated_at: new Date(),
    })
    .where(and(eq(reports.id, id), eq(reports.status, "pending")))
    .returning({ id: reports.id });

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "This report was just published and is now locked." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

// Delete a pending report (hard) or retract an approved one (soft + R2 scrub).
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isJson(request)) {
    return NextResponse.json({ error: "Unsupported content type." }, { status: 415 });
  }

  const report = await authorizeManage(id);
  if (!report) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Grab storage keys before we remove anything so we can scrub R2.
  const imageRows = await db
    .select({ storage_key: report_images.storage_key })
    .from(report_images)
    .where(eq(report_images.report_id, id));
  const keys = imageRows.map((row) => row.storage_key);

  if (report.status === "pending") {
    // Nothing public yet — hard delete. FK cascade removes the image rows.
    await db.delete(reports).where(eq(reports.id, id));
    if (keys.length > 0 && r2Configured()) await deleteObjects(keys);
    return NextResponse.json({ ok: true, deleted: true });
  }

  if (report.status === "approved") {
    // Hide first: every public read filters status='approved', so the page
    // 404s immediately. Then scrub R2 so evidence/receipt images (the receipt
    // contains buyer PII) aren't left publicly fetchable.
    const swap = await db
      .update(reports)
      .set({ status: "retracted", updated_at: new Date() })
      .where(and(eq(reports.id, id), eq(reports.status, "approved")))
      .returning({ id: reports.id });
    if (swap.length === 0) {
      return NextResponse.json({ error: "Could not retract." }, { status: 409 });
    }
    if (keys.length > 0) {
      if (r2Configured()) await deleteObjects(keys);
      await db.delete(report_images).where(eq(report_images.report_id, id));
    }
    return NextResponse.json({ ok: true, retracted: true });
  }

  // Already rejected or retracted — nothing to do.
  return NextResponse.json({ ok: true });
}
