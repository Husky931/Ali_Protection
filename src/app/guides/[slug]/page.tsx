import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Navbar";
import { guides, getGuide } from "@/lib/guides";
import { SITE_NAME, SITE_URL, OG_IMAGE, absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  const path = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: guide.title,
      description: guide.description,
      siteName: SITE_NAME,
      publishedTime: new Date(guide.published).toISOString(),
      modifiedTime: new Date(guide.updated).toISOString(),
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description, images: [OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const canonical = absoluteUrl(`/guides/${guide.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      datePublished: new Date(guide.published).toISOString(),
      dateModified: new Date(guide.updated).toISOString(),
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      url: canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
        { "@type": "ListItem", position: 3, name: guide.title, item: canonical },
      ],
    },
  ];

  return (
    <div className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article>
        <section style={{ paddingTop: 36, paddingBottom: 30, borderBottom: "1px solid var(--line)" }}>
          <div className="container-narrow">
            <Link href="/guides" className="btn-link">
              <Icon name="arrow-left" size={13} /> All guides
            </Link>
            <span className="eyebrow" style={{ display: "block", marginTop: 18 }}>{guide.eyebrow}</span>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-.03em", lineHeight: 1.1, marginTop: 10, textWrap: "balance" }}>
              {guide.title}
            </h1>
            <div style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.7, color: "var(--ink)", marginTop: 16 }}>
              {guide.intro.map((p, i) => (
                <p key={i} style={{ margin: "0 0 1em" }}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 30, paddingBottom: 40 }}>
          <div className="container-narrow">
            {guide.sections.map((s, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, letterSpacing: "-.02em", marginBottom: 10 }}>{s.heading}</h2>
                <div style={{ fontSize: 16.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
                  {s.body.map((p, j) => (
                    <p key={j} style={{ margin: "0 0 .9em" }}>{p}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA strip */}
            <div style={{
              marginTop: 24, padding: 28,
              background: "linear-gradient(135deg, var(--accent-soft), var(--accent-soft-2))",
              border: "1px solid oklch(0.84 0.10 60)",
              borderRadius: 18,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap",
            }}>
              <div style={{ maxWidth: 460 }}>
                <h3 style={{ fontSize: 20, letterSpacing: "-.02em", color: "var(--accent-ink)" }}>Search a seller before you wire money.</h3>
                <p className="muted small" style={{ marginTop: 6, lineHeight: 1.5 }}>
                  Browse real buyer reports of Alibaba scams, or share your own to warn others.
                </p>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <Link href="/reports" className="btn btn-accent">Browse reports</Link>
                <Link href="/submit-report" className="btn btn-ghost">Report a seller</Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
