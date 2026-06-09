import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";

export const metadata: Metadata = {
  title: "Report a Seller — Scam Reports",
  description:
    "Report a fraudulent seller. Share your experience to help protect other buyers from scams.",
};

export default function SubmitReportPage() {
  return (
    <div className="page">
      <ReportForm />
    </div>
  );
}
