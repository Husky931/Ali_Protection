import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports, report_images } from "@/lib/db/schema";
import { ReportStatus } from "@/lib/reportTypes";
import {
  copyObject,
  deleteObjects,
  isMissingObjectError,
  r2Configured,
  headObject,
} from "@/lib/r2";
import { isAuthorized } from "@/lib/adminAuth";
import { emailConfigured, sendReportStatusEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";
// === TEMP-SEED-EDIT: imports for in-admin field/photo editing (remove with feature) ===
import {
  PENDING_KEY_PATTERN,
  MAX_IMAGES_PER_REPORT,
  MAX_IMAGE_BYTES,
  isAllowedImageType,
} from "@/lib/images";
import { validateReportFields } from "@/lib/validateReport";
import { ReportInsert } from "@/lib/reportTypes";

type AdminEditPayload = {
  fields?: Partial<ReportInsert>;
  add_images?: string[];
  remove_image_ids?: string[];
};

// Edit a pending report's fields and/or evidence photos before approval. The
// editor UI always sends the full field set, so we validate it exactly like a
// fresh submission. New photos arrive as verified pending/ R2 keys (same flow
// as the public form); on approval they get copied to the public prefix.
async function handleAdminEdit(
  id: string,
  edit: AdminEditPayload,
): Promise<NextResponse> {
  try {
    const [rep] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);
    if (!rep) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    if (edit.fields) {
      const v = validateReportFields(edit.fields);
      if (!v.ok) {
        return NextResponse.json({ error: v.errors.join(" ") }, { status: 400 });
      }
      const f = edit.fields;
      await db
        .update(reports)
        .set({
          seller_name: (f.seller_name ?? "").trim(),
          seller_url: (f.seller_url ?? "").trim(),
          platform: (f.platform ?? "Alibaba.com").trim() || "Alibaba.com",
          product_name: (f.product_name ?? "").trim(),
          product_url:
            typeof f.product_url === "string" ? f.product_url.trim() : "",
          quantity: String(v.values.quantity),
          total_price: String(v.values.totalPrice),
          currency: (f.currency ?? "").trim(),
          industry: (f.industry ?? "").trim(),
          details: (f.details ?? "").trim(),
          updated_at: new Date(),
        })
        .where(eq(reports.id, id));
    }

    if (Array.isArray(edit.remove_image_ids) && edit.remove_image_ids.length > 0) {
      const existing = await db
        .select()
        .from(report_images)
        .where(eq(report_images.report_id, id));
      const toRemove = existing.filter((r) =>
        edit.remove_image_ids!.includes(r.id),
      );
      if (toRemove.length > 0) {
        if (r2Configured()) {
          await deleteObjects(toRemove.map((r) => r.storage_key));
        }
        for (const r of toRemove) {
          await db.delete(report_images).where(eq(report_images.id, r.id));
        }
      }
    }

    if (Array.isArray(edit.add_images) && edit.add_images.length > 0) {
      const keys = Array.from(new Set(edit.add_images)).filter(
        (k): k is string => typeof k === "string",
      );
      const existing = await db
        .select()
        .from(report_images)
        .where(eq(report_images.report_id, id));
      if (existing.length + keys.length > MAX_IMAGES_PER_REPORT) {
        return NextResponse.json(
          { error: `At most ${MAX_IMAGES_PER_REPORT} photos per report.` },
          { status: 400 },
        );
      }
      let pos = existing.reduce((m, r) => Math.max(m, r.position + 1), 0);
      for (const key of keys) {
        if (!PENDING_KEY_PATTERN.test(key)) {
          return NextResponse.json(
            { error: "Invalid image reference." },
            { status: 400 },
          );
        }
        const meta = await headObject(key);
        if (
          !meta ||
          !isAllowedImageType(meta.contentType) ||
          meta.sizeBytes <= 0 ||
          meta.sizeBytes > MAX_IMAGE_BYTES
        ) {
          return NextResponse.json(
            { error: "One or more photos could not be verified." },
            { status: 400 },
          );
        }
        await db.insert(report_images).values({
          report_id: id,
          storage_key: key,
          content_type: meta.contentType,
          size_bytes: meta.sizeBytes,
          position: pos++,
          kind: "evidence",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to edit report." },
      { status: 500 },
    );
  }
}
// === END TEMP-SEED-EDIT ===

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: {
    status?: ReportStatus;
    purchase_verified?: boolean;
    edit?: AdminEditPayload; // TEMP-SEED-EDIT
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  // === TEMP-SEED-EDIT: route field/photo edits separately from moderation ===
  if (body.edit) {
    return handleAdminEdit(id, body.edit);
  }
  // === END TEMP-SEED-EDIT ===

  const hasStatus = body.status === "approved" || body.status === "rejected";
  const hasPurchaseToggle = typeof body.purchase_verified === "boolean";
  if (!hasStatus && !hasPurchaseToggle) {
    return NextResponse.json(
      { error: "Provide status (approved|rejected) and/or purchase_verified." },
      { status: 400 },
    );
  }
  const extra = hasPurchaseToggle
    ? { purchase_verified: body.purchase_verified }
    : {};

  try {
    const [report] = await db
      .select({
        id: reports.id,
        slug: reports.slug,
        seller_name: reports.seller_name,
        submitter_email: reports.submitter_email,
        email_verified: reports.email_verified,
      })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    // Standalone "purchase verified" toggle — no status change.
    if (!hasStatus) {
      await db
        .update(reports)
        .set({ ...extra, updated_at: new Date() })
        .where(eq(reports.id, id));
      return NextResponse.json({ ok: true });
    }

    const imageRows = await db
      .select()
      .from(report_images)
      .where(eq(report_images.report_id, id))
      .orderBy(asc(report_images.position));

    if (body.status === "approved") {
      // Publish evidence: copy each staged object from the non-public
      // pending/ prefix to its permanent, publicly-served key, then update the
      // row. Re-running after a partial failure is safe — already-moved rows
      // no longer match the pending/ prefix and are skipped.
      const pendingRows = imageRows.filter((row) =>
        row.storage_key.startsWith("pending/"),
      );
      if (pendingRows.length > 0 && !r2Configured()) {
        return NextResponse.json(
          { error: "R2 is not configured; cannot publish report images." },
          { status: 500 },
        );
      }
      for (const row of pendingRows) {
        const extension = row.content_type === "image/webp" ? "webp" : "jpg";
        const destKey = `reports/${id}/${row.position}.${extension}`;
        try {
          await copyObject(row.storage_key, destKey, row.content_type);
        } catch (error) {
          if (isMissingObjectError(error)) {
            // Staged object expired (the pending/ lifecycle rule sweeps after
            // 7 days) — drop the row so the report can still be approved.
            await db.delete(report_images).where(eq(report_images.id, row.id));
            continue;
          }
          throw error;
        }
        await db
          .update(report_images)
          .set({ storage_key: destKey })
          .where(eq(report_images.id, row.id));
      }
      await db
        .update(reports)
        .set({ status: "approved", updated_at: new Date(), ...extra })
        .where(eq(reports.id, id));
      if (pendingRows.length > 0) {
        // Best-effort: the pending/ lifecycle rule sweeps anything missed.
        await deleteObjects(pendingRows.map((row) => row.storage_key));
      }
    } else {
      await db
        .update(reports)
        .set({ status: "rejected", updated_at: new Date(), ...extra })
        .where(eq(reports.id, id));
      if (imageRows.length > 0) {
        if (r2Configured()) {
          await deleteObjects(imageRows.map((row) => row.storage_key));
        }
        await db.delete(report_images).where(eq(report_images.report_id, id));
      }
    }

    // Notify the submitter of the decision if they opted into email.
    if (report.email_verified && report.submitter_email && emailConfigured()) {
      try {
        await sendReportStatusEmail({
          to: report.submitter_email,
          sellerName: report.seller_name,
          decision: body.status as "approved" | "rejected",
          url: absoluteUrl(`/reports/${report.slug}`),
        });
      } catch {
        /* non-critical */
      }
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to update report." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
