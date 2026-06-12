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

const adminPassword = process.env.ADMIN_PASSWORD;

function isAuthorized(request: Request) {
  if (!adminPassword) {
    return false;
  }
  const header = request.headers.get("x-admin-password");
  return header === adminPassword;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { status?: ReportStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json(
      { error: "status must be approved or rejected." },
      { status: 400 },
    );
  }

  try {
    const [report] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
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
        .set({ status: "approved", updated_at: new Date() })
        .where(eq(reports.id, id));
      if (pendingRows.length > 0) {
        // Best-effort: the pending/ lifecycle rule sweeps anything missed.
        await deleteObjects(pendingRows.map((row) => row.storage_key));
      }
    } else {
      await db
        .update(reports)
        .set({ status: "rejected", updated_at: new Date() })
        .where(eq(reports.id, id));
      if (imageRows.length > 0) {
        if (r2Configured()) {
          await deleteObjects(imageRows.map((row) => row.storage_key));
        }
        await db.delete(report_images).where(eq(report_images.report_id, id));
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
