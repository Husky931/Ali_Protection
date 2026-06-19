import { ManageResendForm } from "@/components/ManageResendForm";

export default async function ManageIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container-narrow" style={{ paddingTop: 48, paddingBottom: 100 }}>
      <span className="eyebrow">Manage a report</span>
      <h1 style={{ fontSize: "clamp(26px, 4vw, 34px)", letterSpacing: "-.03em", lineHeight: 1.1, marginTop: 8, marginBottom: 10 }}>
        Find your report
      </h1>
      <p className="muted" style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 20 }}>
        Enter the email you used when you submitted, and we&rsquo;ll send your private link to update or delete your report. No password needed.
      </p>
      <div className="paper" style={{ padding: 24 }}>
        <ManageResendForm invalid={error === "invalid"} />
      </div>
    </div>
  );
}
