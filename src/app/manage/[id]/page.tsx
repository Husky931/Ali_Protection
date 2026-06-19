import { eq, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { report_updates } from "@/lib/db/schema";
import { authorizeManage } from "@/lib/manageSession";
import { absoluteUrl } from "@/lib/site";
import { ManagePanel, type ManageData } from "@/components/ManagePanel";

export default async function ManageReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await authorizeManage(id);

  if (!report) {
    return (
      <div className="container-narrow" style={{ paddingTop: 64, paddingBottom: 100, textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", letterSpacing: "-.02em", marginBottom: 12 }}>
          This link isn&rsquo;t valid
        </h1>
        <p className="muted" style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 460, margin: "0 auto 28px" }}>
          It may have expired, or you&rsquo;re on a different device than the one you opened it on. Request a fresh link below.
        </p>
        <a href="/manage" className="btn btn-primary">Get a new link</a>
      </div>
    );
  }

  const updateRows = await db
    .select()
    .from(report_updates)
    .where(eq(report_updates.report_id, id))
    .orderBy(desc(report_updates.created_at));

  const data: ManageData = {
    id: report.id,
    slug: report.slug,
    status: report.status,
    seller_name: report.seller_name,
    seller_url: report.seller_url,
    product_name: report.product_name,
    product_url: report.product_url,
    quantity: String(report.quantity),
    total_price: String(report.total_price),
    currency: report.currency,
    industry: report.industry,
    details: report.details,
    platform: report.platform,
    updates: updateRows.map((u) => ({
      id: u.id,
      body: u.body,
      status: u.status,
      created_at: String(u.created_at),
    })),
    publicUrl:
      report.status === "approved" ? absoluteUrl(`/reports/${report.slug}`) : null,
  };

  return (
    <div className="container-narrow" style={{ paddingTop: 40, paddingBottom: 100 }}>
      <ManagePanel data={data} />
    </div>
  );
}
