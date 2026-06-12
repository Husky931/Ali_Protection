import { NextResponse } from "next/server";
import { eq, desc, inArray, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports, report_images } from "@/lib/db/schema";
import { AdminReportImage } from "@/lib/reportTypes";
import { presignView, r2Configured } from "@/lib/r2";

const adminPassword = process.env.ADMIN_PASSWORD;

function isAuthorized(request: Request) {
  if (!adminPassword) {
    return false;
  }
  const header = request.headers.get("x-admin-password");
  return header === adminPassword;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const data = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "pending"))
      .orderBy(desc(reports.created_at));

    // Pending evidence images live in the non-public pending/ prefix, so the
    // moderation queue views them through short-lived presigned URLs.
    const imagesByReport = new Map<string, AdminReportImage[]>();
    if (data.length > 0 && r2Configured()) {
      const imageRows = await db
        .select()
        .from(report_images)
        .where(
          inArray(
            report_images.report_id,
            data.map((report) => report.id),
          ),
        )
        .orderBy(asc(report_images.position));

      const signed = await Promise.all(
        imageRows.map(async (row) => {
          try {
            return { row, url: await presignView(row.storage_key) };
          } catch {
            // A missing/unsignable object shouldn't take down the queue.
            return null;
          }
        }),
      );
      // Assemble after the parallel presign so position order is preserved.
      for (const item of signed) {
        if (!item) continue;
        const list = imagesByReport.get(item.row.report_id) ?? [];
        list.push({ id: item.row.id, url: item.url });
        imagesByReport.set(item.row.report_id, list);
      }
    }

    return NextResponse.json({
      data: data.map((report) => ({
        ...report,
        images: imagesByReport.get(report.id) ?? [],
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load reports." },
      { status: 500 },
    );
  }
}
