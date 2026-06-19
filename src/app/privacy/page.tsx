import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalH2, LegalP } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Alibaba Scammer",
  description:
    "What we collect and how we handle it. Reports are anonymous by default; email is optional.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 15, 2026"
      intro="Reports are anonymous by default. We collect as little as possible."
    >
      <LegalH2>Reports</LegalH2>
      <LegalP>
        You can submit a report without an account and without giving us your name. We do
        not store your IP address with your report. Photos are stripped of EXIF/location
        metadata in your browser before they are uploaded.
      </LegalP>

      <LegalH2>Your email (optional)</LegalH2>
      <LegalP>
        After submitting, you may optionally add an email so you can manage your report
        later. If you do, we use it only to send your private manage link and to tell you
        once your report has been reviewed. Your email is never shown publicly and is not
        used for marketing.
      </LegalP>

      <LegalH2>Order receipts (optional)</LegalH2>
      <LegalP>
        If you attach an order receipt to support your report, it is kept private — used
        only by a moderator to verify your purchase, and never published. We may show a
        &ldquo;Purchase verified&rdquo; badge on your report, but never the document
        itself.
      </LegalP>

      <LegalH2>Cookies</LegalH2>
      <LegalP>
        If you open a manage link, we set one essential, http-only cookie so the page
        recognises you without putting your secret link in the address bar. In production
        we also use Google Analytics to understand traffic.
      </LegalP>

      <LegalH2>Service providers</LegalH2>
      <LegalP>
        We rely on a small number of processors: Neon (database), Cloudflare R2 (image
        storage), Resend (transactional email), and Google Analytics. IP addresses and
        emails used for rate-limiting are stored only as one-way hashes.
      </LegalP>

      <LegalH2>Deleting your data</LegalH2>
      <LegalP>
        If you added an email, you can delete your report at any time from your manage
        link (request it on the{" "}
        <Link href="/manage" className="btn-link">manage page</Link>). Otherwise, reach us
        via the <Link href="/contact" className="btn-link">contact page</Link>.
      </LegalP>
    </LegalPage>
  );
}
