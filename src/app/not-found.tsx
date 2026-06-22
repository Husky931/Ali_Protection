import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page">
      <section style={{ paddingTop: 72, paddingBottom: 80 }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".12em",
              color: "var(--muted)",
              marginBottom: 14,
            }}
          >
            404 — Not found
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              letterSpacing: "-.03em",
              lineHeight: 1.1,
              textWrap: "balance",
            }}
          >
            We couldn&rsquo;t find that page
          </h1>
          <p className="muted" style={{ fontSize: 17, marginTop: 14, lineHeight: 1.5 }}>
            The report or page you&rsquo;re looking for doesn&rsquo;t exist, was never
            approved, or may have been removed.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            <Link href="/reports" className="btn btn-accent">
              Browse all reports
            </Link>
            <Link href="/" className="btn btn-ghost">
              Go to homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
