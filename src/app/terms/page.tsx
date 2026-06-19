import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalH2, LegalP } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Alibaba Scammer",
  description:
    "The terms governing use of Alibaba Scammer and the submission of buyer reports.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 15, 2026"
      intro="By using this site or submitting a report, you agree to these terms. Please read them — especially the part about telling the truth."
    >
      <LegalH2>What this site is</LegalH2>
      <LegalP>
        Alibaba Scammer is a community-run database of buyer reports about sellers on
        overseas wholesale marketplaces. We are not affiliated with Alibaba Group or any
        marketplace. Reports are the accounts and opinions of the buyers who submitted
        them, not statements of fact by us.
      </LegalP>

      <LegalH2>Your submission</LegalH2>
      <LegalP>When you submit a report, you confirm that:</LegalP>
      <ul style={{ margin: "0 0 14px", paddingLeft: 20 }}>
        <li style={{ marginBottom: 6 }}>It is truthful and based on your own genuine, first-hand experience.</li>
        <li style={{ marginBottom: 6 }}>You have the right to share any text and images you attach.</li>
        <li style={{ marginBottom: 6 }}>You are not posting it to harass, extort, or knowingly mislead.</li>
        <li style={{ marginBottom: 6 }}>You grant us a non-exclusive, royalty-free licence to publish, store, and display it.</li>
      </ul>
      <LegalP>
        You are responsible for what you submit. To the extent permitted by law, you
        agree to indemnify us against claims arising from a report you submitted that
        was false or that you had no right to share.
      </LegalP>

      <LegalH2>Moderation</LegalH2>
      <LegalP>
        Every report is reviewed by a human before it is published. We review in good
        faith for spam, obvious falsehoods, and verifiable detail, but we cannot confirm
        every claim and we do not guarantee accuracy. We may edit, decline, or remove any
        report at our discretion, and we may correct or take down content following a
        credible complaint.
      </LegalP>

      <LegalH2>If a report concerns you</LegalH2>
      <LegalP>
        If you are a seller and believe a report about you is inaccurate, you can request
        a review, reply, or removal through our{" "}
        <Link href="/contact" className="btn-link">contact page</Link>.
      </LegalP>

      <LegalH2>No warranty &amp; limitation of liability</LegalH2>
      <LegalP>
        The site is provided &ldquo;as is&rdquo; without warranties of any kind. To the
        fullest extent permitted by law, we are not liable for any decision you make based
        on a report, or for the content of reports submitted by users.
      </LegalP>

      <LegalH2>Changes</LegalH2>
      <LegalP>
        We may update these terms. Material changes will be reflected in the &ldquo;last
        updated&rdquo; date above.
      </LegalP>
    </LegalPage>
  );
}
