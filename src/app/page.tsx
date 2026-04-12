import { ReportForm } from "@/components/ReportForm";
import { Report } from "@/lib/reportTypes";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getApprovedReports(): Promise<Report[]> {
  try {
    const data = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "approved"))
      .orderBy(desc(reports.created_at));

    return data.map((r) => ({
      ...r,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at?.toISOString() ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const reports = await getApprovedReports();

  return (
    <div className="min-h-screen bg-primary text-ink">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-primary to-orange-50 px-6 py-20 sm:py-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 text-center lg:flex-row lg:gap-12 lg:text-left">
          <div className="flex flex-1 flex-col gap-6">
            <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Have you been scammed by a bad deal on{" "}
              <span className="text-orange-600">Alibaba</span>?
            </h1>
            <p className="text-lg text-muted sm:text-xl">
              You&apos;re not alone. Share your story and help protect others from
              fraudulent sellers.
            </p>
            <a
              href="#share-story"
              className="w-fit cursor-pointer self-center rounded-lg bg-ink px-8 py-4 text-lg font-semibold text-white transition hover:bg-black hover:shadow-lg lg:self-start"
            >
              Share Your Story
            </a>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <div className="relative h-64 w-full max-w-md overflow-hidden rounded-2xl bg-orange-100 shadow-xl sm:h-80">
              <Image
                src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
                alt="Person feeling frustrated with online shopping"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-2xl border border-orange-200 bg-surface p-8 shadow-sm sm:p-12">
            <h2 className="mb-6 text-3xl font-semibold text-ink">
              Why I Started This Website
            </h2>
            <div className="prose prose-lg max-w-none text-ink">
              <p className="text-base leading-relaxed text-muted sm:text-lg">
                I know firsthand what it feels like to be scammed on Alibaba. After
                placing an order and sending payment, I received a product that was
                completely different from what was advertised—poor quality, wrong
                specifications, and nothing like the seller promised. When I tried to
                get a refund, the seller became unresponsive, and I lost my money.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                That experience made me realize how many others must be going through
                the same thing. So I created this platform as a safe space where people
                can share their stories, warn others about fraudulent sellers, and help
                build a community that protects honest buyers. Your voice matters, and
                together we can make online shopping safer for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Share Your Story Section */}
      <section id="share-story" className="bg-surface px-6 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-semibold text-ink">
              Share Your Story
            </h2>
            <p className="text-base text-muted sm:text-lg">
              Help others avoid the same experience. Every report helps protect our
              community.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <ReportForm />
          </div>
        </div>
      </section>

      {/* Reports Section */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-semibold text-ink">
                Community Reports
              </h2>
              <p className="text-base text-muted sm:text-lg">
                Stories shared by members of our community
              </p>
            </div>
            {reports.length > 0 && (
              <div className="rounded-full bg-orange-100 px-5 py-2">
                <p className="text-sm font-semibold text-orange-900">
                  {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                </p>
              </div>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <p className="text-lg text-muted">
                No reports yet. Be the first to share your story and help protect
                others.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 transition hover:border-orange-300 hover:shadow-md sm:p-8"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-ink sm:text-2xl">
                          {report.product_name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-orange-600 sm:text-base">
                          {report.seller_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900 sm:text-sm">
                          {report.industry}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                      <span>
                        <span className="font-medium">{report.currency}</span>{" "}
                        {Number(report.total_price).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>
                        Quantity: <span className="font-medium">{report.quantity}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize">{report.platform}</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-base leading-relaxed text-ink sm:text-lg">
                      {report.details}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                    <a
                      className="cursor-pointer text-sm font-medium text-accent underline transition hover:text-orange-600"
                      href={report.seller_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Seller Profile →
                    </a>
                    <a
                      className="cursor-pointer text-sm font-medium text-accent underline transition hover:text-orange-600"
                      href={report.product_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Product Listing →
                    </a>
                    <p className="ml-auto text-xs text-muted">
                      Reported on {new Date(report.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
