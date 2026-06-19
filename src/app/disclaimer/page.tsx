import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalH2, LegalP } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer — Alibaba Scammer",
  description:
    "Reports reflect the experiences and opinions of the buyers who submitted them. We are not affiliated with Alibaba.",
  alternates: { canonical: "/disclaimer" },
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="June 15, 2026">
      <LegalP>
        Alibaba Scammer publishes reports submitted by buyers about their own experiences
        with sellers on overseas wholesale marketplaces. Each report reflects the personal
        account and opinion of the individual who submitted it. It is not a statement of
        fact by us, and publishing a report is not an accusation or finding by us.
      </LegalP>

      <LegalH2>Not affiliated with Alibaba</LegalH2>
      <LegalP>
        We are an independent, community-run project. We are not affiliated with, endorsed
        by, or connected to Alibaba Group or any other marketplace mentioned on this site.
        Company and product names are used only to identify the seller a report is about.
      </LegalP>

      <LegalH2>We moderate, but we can&rsquo;t verify everything</LegalH2>
      <LegalP>
        Every report is reviewed by a human before publication, and we remove what looks
        like spam or libel. But we cannot independently confirm every claim. Treat reports
        as one buyer&rsquo;s side of a story, and do your own due diligence before making a
        purchasing decision.
      </LegalP>

      <LegalH2>Are you the seller?</LegalH2>
      <LegalP>
        If a report names your business and you believe it is inaccurate, you can reply or
        request a review or removal through our{" "}
        <Link href="/contact" className="btn-link">contact page</Link>. We take credible
        complaints seriously.
      </LegalP>
    </LegalPage>
  );
}
