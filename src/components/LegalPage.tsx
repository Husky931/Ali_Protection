import React from "react";

// Shared shell for the static legal/policy pages so they stay visually
// consistent. Server component — no interactivity.
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated?: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page">
      <section style={{ paddingTop: 56, paddingBottom: 60 }}>
        <div className="container-narrow">
          <h1 style={{ fontSize: "clamp(30px, 4vw, 42px)", letterSpacing: "-.03em", lineHeight: 1.1 }}>
            {title}
          </h1>
          {updated && (
            <p className="muted small" style={{ marginTop: 10 }}>
              Last updated {updated}
            </p>
          )}
          {intro && (
            <p style={{ marginTop: 18, fontSize: 17, lineHeight: 1.6, color: "var(--ink-2)" }}>
              {intro}
            </p>
          )}
          <div style={{ marginTop: 28, fontSize: 16, lineHeight: 1.7, color: "var(--ink-2)" }}>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 19, letterSpacing: "-.01em", color: "var(--ink)", margin: "30px 0 8px" }}>
      {children}
    </h2>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}
