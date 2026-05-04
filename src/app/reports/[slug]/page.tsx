import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type Props = { params: Promise<{ slug: string }> };

async function getReport(slug: string) {
  const [report] = await db
    .select()
    .from(reports)
    .where(and(eq(reports.slug, slug), eq(reports.status, "approved")))
    .limit(1);
  return report ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) return { title: "Report Not Found" };

  const title = `${report.product_name} from ${report.seller_name} — Scam Report`;
  const description = report.details.slice(0, 160);

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) notFound();

  return (
    <div className="min-h-screen bg-primary px-6 py-12 text-ink">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/#reports"
          className="mb-6 inline-block text-sm text-accent underline transition hover:text-orange-600"
        >
          ← Back to all reports
        </Link>

        <article className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                {report.product_name}
              </h1>
              <p className="mt-1 text-base font-medium text-orange-600 sm:text-lg">
                {report.seller_name}
              </p>
            </div>
            <span className="mt-2 w-fit rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-900 sm:mt-0">
              {report.industry}
            </span>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted">
            <span>
              <span className="font-medium">{report.currency}</span>{" "}
              {Number(report.total_price).toLocaleString()}
            </span>
            <span>·</span>
            <span>
              Quantity: <span className="font-medium">{report.quantity}</span>
            </span>
            <span>·</span>
            <span className="capitalize">{report.platform}</span>
            <span>·</span>
            <span>
              {new Date(report.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="mb-6 rounded-lg bg-orange-50 p-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">
              What happened
            </h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-ink">
              {report.details}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-border pt-6">
            <a
              className="text-sm font-medium text-accent underline transition hover:text-orange-600"
              href={report.seller_url}
              target="_blank"
              rel="noreferrer"
            >
              View Seller Profile →
            </a>
            <a
              className="text-sm font-medium text-accent underline transition hover:text-orange-600"
              href={report.product_url}
              target="_blank"
              rel="noreferrer"
            >
              View Product Listing →
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
