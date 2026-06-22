import { NextResponse } from "next/server";
import { eq, desc, inArray, asc, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports, report_images } from "@/lib/db/schema";
import {
  Report,
  AdminReport,
  AdminReportImage,
  AdminReportDuplicate,
} from "@/lib/reportTypes";
import { presignView, r2Configured } from "@/lib/r2";
import { isAuthorized } from "@/lib/adminAuth";

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
    const receiptsByReport = new Map<string, AdminReportImage[]>();
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
      // Receipts (private order receipts) are kept in their own bucket.
      for (const item of signed) {
        if (!item) continue;
        const target =
          item.row.kind === "receipt" ? receiptsByReport : imagesByReport;
        const list = target.get(item.row.report_id) ?? [];
        list.push({
          id: item.row.id,
          url: item.url,
          contentType: item.row.content_type,
        });
        target.set(item.row.report_id, list);
      }
    }

    // Possible-duplicate hint for moderators: other reports sharing a pending
    // report's seller URL or submitter email. Guarded so a dedup hiccup never
    // takes down the queue, and never a block — just a signal.
    const duplicatesByReport = new Map<string, AdminReportDuplicate[]>();
    try {
      const sellerUrls = [
        ...new Set(data.map((r) => r.seller_url).filter(Boolean)),
      ];
      const emails = [
        ...new Set(
          data
            .map((r) => r.submitter_email)
            .filter((e): e is string => Boolean(e)),
        ),
      ];
      const conds = [];
      if (sellerUrls.length)
        conds.push(inArray(reports.seller_url, sellerUrls));
      if (emails.length)
        conds.push(inArray(reports.submitter_email, emails));

      if (conds.length > 0) {
        const candidates = await db
          .select({
            id: reports.id,
            slug: reports.slug,
            seller_name: reports.seller_name,
            status: reports.status,
            seller_url: reports.seller_url,
            submitter_email: reports.submitter_email,
          })
          .from(reports)
          .where(conds.length === 1 ? conds[0] : or(...conds));

        for (const report of data) {
          const dups = candidates
            .filter(
              (c) =>
                c.id !== report.id &&
                (c.seller_url === report.seller_url ||
                  (!!report.submitter_email &&
                    c.submitter_email === report.submitter_email)),
            )
            .map((c) => ({
              id: c.id,
              slug: c.slug,
              seller_name: c.seller_name,
              status: c.status,
            }));
          if (dups.length > 0) duplicatesByReport.set(report.id, dups);
        }
      }
    } catch {
      // Duplicates are a non-critical hint; ignore failures.
    }

    // Strip the secret columns that select() returns (token hashes, raw email)
    // before sending to the moderation client; surface only derived signals.
    const payload: AdminReport[] = data.map((report) => {
      const safe = { ...report } as Record<string, unknown>;
      delete safe.claim_secret_hash;
      delete safe.manage_token_hash;
      delete safe.claim_expires_at;
      delete safe.submitter_email;
      return {
        ...(safe as unknown as Report),
        images: imagesByReport.get(report.id) ?? [],
        receipts: receiptsByReport.get(report.id) ?? [],
        has_email: Boolean(report.submitter_email),
        email_verified: report.email_verified,
        possible_duplicates: duplicatesByReport.get(report.id) ?? [],
      };
    });

    return NextResponse.json({ data: payload });
  } catch {
    return NextResponse.json(
      { error: "Failed to load reports." },
      { status: 500 },
    );
  }
}
