import { Report } from "@/lib/reportTypes";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { HeroImage } from "@/components/HeroImage";
import { SearchBox } from "@/components/SearchBox";
import { FloatingReportButton } from "@/components/FloatingReportButton";

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
  const approvedReports = await getApprovedReports();

  return (
    <div className="min-h-screen bg-primary text-ink">
      {/* Hero Section – Mobile */}
      <section className="bg-gradient-to-br from-orange-50 via-primary to-orange-50 lg:hidden">
        <div className="w-full">
          <HeroImage width={1612} height={1464} className="h-auto w-full" />
        </div>
        <div className="flex flex-col items-center gap-5 px-6 pb-12 pt-6 text-center">
          <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
            The place on the web to report a bad{" "}
            <span className="text-orange-600">Alibaba</span> deal
          </h1>
          <p className="text-base text-muted sm:text-lg">
            Share your story. Protect others from fraudulent sellers.
          </p>
          <a
            href="#reports"
            className="w-fit rounded-lg bg-ink px-7 py-3.5 text-base font-semibold text-white transition hover:bg-black hover:shadow-lg"
          >
            Browse Reports
          </a>
        </div>
      </section>

      {/* Hero Section – Desktop */}
      <section className="hidden bg-gradient-to-br from-orange-50 via-primary to-orange-50 lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-10 px-8 py-20 xl:gap-14">
          <div className="flex w-1/4 shrink-0 flex-col gap-6">
            <h1 className="text-4xl font-bold leading-tight text-ink xl:text-5xl">
              The place on the web to report a bad{" "}
              <span className="text-orange-600">Alibaba</span> deal
            </h1>
            <p className="text-base text-muted xl:text-lg">
              Share your story. Protect others from fraudulent sellers.
            </p>
            <a
              href="#reports"
              className="w-fit rounded-lg bg-ink px-7 py-3.5 text-base font-semibold text-white transition hover:bg-black hover:shadow-lg"
            >
              Browse Reports
            </a>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-2xl shadow-2xl">
            <HeroImage width={1200} height={800} className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-2xl border border-orange-200 bg-surface p-8 shadow-sm sm:p-12">
            <h2 className="mb-6 text-3xl font-semibold text-black">
              Why This Website Exists
            </h2>
            <div className="prose prose-lg max-w-none text-ink">
              <p className="text-base leading-relaxed text-black sm:text-lg">
                The screenshot above tells a big story about how Alibaba is
                setup. The platform has always protected sellers, even with the
                only safety net a buyer has, the Trade Assurance policy.
              </p>
              <p className="mt-4 text-base leading-relaxed text-black sm:text-lg">
                We can see from the image even though the buyer has bad comments
                and 1 star ratings, it does not appear on the overall score. Its
                very hard and time consuming to go through even seller, check all
                the comments, ratings, try to figure out if its a proper factory
                or some sketchy middleman and in the end, even the platform
                itself to hide the bad ratings.
              </p>
              <p className="mt-4 text-base leading-relaxed text-black sm:text-lg">
                I know first hand what it feels like to be scammed on Alibaba.
                After placing an order and sending payment, I received a product
                that was completely different from what was advertised—poor
                quality, wrong specifications, and nothing like the seller
                promised. When I tried to get a refund, after going back and forth little bit, he eventually stoped replying and i never saw my money. The product itself was unusuable, so pretty much wasted money, time and energy
              </p>
              <p className="mt-4 text-base leading-relaxed text-black sm:text-lg">
                That experience made me realize how many others must be going
                through the same thing. So here we can build a community, add
                the names of the sellers if a bad deal has happened and maybe
                help other people in future. Your voice matters, and together we
                can make online shopping safer for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Section */}
      <section id="reports" className="px-6 py-16 sm:py-20">
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
            {approvedReports.length > 0 && (
              <div className="rounded-full bg-orange-100 px-5 py-2">
                <p className="text-sm font-semibold text-orange-900">
                  {approvedReports.length}{" "}
                  {approvedReports.length === 1 ? "Report" : "Reports"}
                </p>
              </div>
            )}
          </div>

          <SearchBox reports={approvedReports} />
        </div>
      </section>

      <FloatingReportButton />
    </div>
  );
}
