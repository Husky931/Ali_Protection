import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";

export const metadata: Metadata = {
  title: "Report a Seller - Alibaba Scam Reports",
  description:
    "Report a fraudulent Alibaba seller. Share your experience to help protect other buyers from scams.",
};

export default function SubmitReportPage() {
  return (
    <div className="min-h-screen bg-primary px-6 py-12 text-ink">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-semibold text-ink">
            Report a Seller
          </h1>
          <p className="text-base text-muted sm:text-lg">
            Help others avoid the same experience. Every report helps protect
            our community.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <ReportForm />
        </div>
      </div>
    </div>
  );
}
