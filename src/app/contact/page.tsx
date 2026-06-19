import type { Metadata } from "next";
import { LegalPage, LegalH2, LegalP } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Contact & Right of Reply — Alibaba Scammer",
  description:
    "Contact us, or — if you're a seller named in a report — reply to it or request a correction or removal.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

// Owner: point this at a real inbox (a Cloudflare email-routing alias on
// alibabascammer.com works). Update the footer's Contact link to match.
const CONTACT_EMAIL = "contact@alibabascammer.com";

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact &amp; right of reply"
      intro="Whether you're a buyer with a question or a seller named in a report, here's how to reach us."
    >
      <LegalH2>Are you the seller in a report?</LegalH2>
      <LegalP>
        If a report names your business and you believe it is inaccurate, you have a right
        of reply. Email us and we will review it in good faith — we can publish your
        response alongside the report, correct it, or take it down if it doesn&rsquo;t hold
        up. Please include:
      </LegalP>
      <ul style={{ margin: "0 0 14px", paddingLeft: 20 }}>
        <li style={{ marginBottom: 6 }}>The link (URL) of the report.</li>
        <li style={{ marginBottom: 6 }}>What specifically is inaccurate.</li>
        <li style={{ marginBottom: 6 }}>Any evidence that supports your account (order records, correspondence, etc.).</li>
      </ul>

      <LegalH2>Everyone else</LegalH2>
      <LegalP>
        Questions, corrections to your own report, or anything else — just email us and
        we&rsquo;ll get back to you.
      </LegalP>

      <p style={{ margin: "22px 0" }}>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Report enquiry")}`}
          className="btn btn-primary"
        >
          Email {CONTACT_EMAIL}
        </a>
      </p>
    </LegalPage>
  );
}
