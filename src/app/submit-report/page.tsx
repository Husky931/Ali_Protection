import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";

export const metadata: Metadata = {
  title: "Report an Alibaba Scammer",
  description:
    "Report a fraudulent Alibaba seller. Share your experience anonymously to help protect other buyers from Alibaba scams.",
  alternates: { canonical: "/submit-report" },
  // Conversion page, not a ranking target — keep it out of the index but let link equity flow.
  robots: { index: false, follow: true },
};

export default function SubmitReportPage() {
  return (
    <div className="page">
      <ReportForm />
    </div>
  );
}
