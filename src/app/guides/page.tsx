import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Navbar";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Alibaba Buyer Guides — Avoid Scams & Source Safely",
  description:
    "Plain-English guides for Alibaba buyers: is Alibaba safe, how to avoid Alibaba scams, spotting red flags, and getting your money back when an order goes wrong.",
  alternates: { canonical: "/guides" },
  robots: { index: true, follow: true },
};

export default function GuidesIndexPage() {
  return (
    <div className="page">
      <section style={{ paddingTop: 56, paddingBottom: 30, borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <span className="eyebrow">Buyer guides</span>
          <h1 style={{ fontSize: "clamp(32px, 4.5vw, 48px)", letterSpacing: "-.03em", marginTop: 10, lineHeight: 1.05 }}>
            Source from <span className="marker" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 600 }}>Alibaba</span> without getting scammed.
          </h1>
          <p className="muted" style={{ fontSize: 17, marginTop: 12, maxWidth: 620 }}>
            Honest, practical guides for first-time importers and small businesses — written by buyers, not by Alibaba.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 30, paddingBottom: 60 }}>
        <div className="container">
          <div className="stack" style={{ gap: 12 }}>
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="paper"
                style={{ display: "block", padding: 22, borderRadius: 8, textDecoration: "none" }}
              >
                <span className="eyebrow">{g.eyebrow}</span>
                <h2 style={{ fontSize: 21, letterSpacing: "-.02em", marginTop: 6, color: "var(--ink)" }}>{g.title}</h2>
                <p className="muted small" style={{ marginTop: 8, lineHeight: 1.5 }}>{g.description}</p>
                <span className="btn-link" style={{ marginTop: 12, display: "inline-flex" }}>
                  Read guide <Icon name="arrow-right" size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
