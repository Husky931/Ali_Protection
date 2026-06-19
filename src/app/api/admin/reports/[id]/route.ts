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
} from "@/lib/r2";
import { isAuthorized } from "@/lib/adminAuth";
import { emailConfigured, sendReportStatusEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { status?: ReportStatus; purchase_verified?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

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
