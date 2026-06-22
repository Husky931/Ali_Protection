import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { report_images } from "@/lib/db/schema";
import { publicImageUrl } from "@/lib/images";

// Batch-fetch published evidence photo URLs for a set of reports, for use in the
// preview cards (ReportRow). Only 'evidence' images already copied to the public
// reports/ prefix are returned — pending/ and private receipts stay hidden, same
// rule as the detail page. Returns a map of report_id -> ordered image URLs.
export async function getEvidenceUrlsByReport(
  reportIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (reportIds.length === 0) return map;

  const rows = await db
    .select()
    .from(report_images)
    .where(inArray(report_images.report_id, reportIds));

  // Order by position so the thumbnails match the detail-page order.
  rows.sort((a, b) => a.position - b.position);

  for (const row of rows) {
    if (row.kind !== "evidence" || !row.storage_key.startsWith("reports/")) continue;
    const url = publicImageUrl(row.storage_key);
    if (!url) continue;
    const list = map.get(row.report_id) ?? [];
    list.push(url);
    map.set(row.report_id, list);
  }

  return map;
}
