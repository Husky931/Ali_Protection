import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { desc, eq, and, like, or } from 'drizzle-orm';
import { Report } from '@/lib/reportTypes';
import { publicReportColumns } from '@/lib/reportSelect';
import { SearchBox, ReportRow } from '@/components/SearchBox';
import { SortSelect } from '@/components/SortSelect';
import { Icon } from '@/components/Navbar';
import Link from 'next/link';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; industry?: string; sort?: string }>;
}): Promise<Metadata> {
  const { q, industry, sort } = await searchParams;
  // Faceted/search permutations are thin duplicates — keep them out of the index but
  // let crawlers follow through to the report pages. Canonicalize them all to /reports.
  const hasParams = Boolean(q || (industry && industry !== 'All') || sort);
  return {
    title: 'Alibaba Scammer List — Reported Scam Sellers',
    description:
      'Browse community-submitted Alibaba scam reports. Search reported scam sellers by name, product, or industry before you place an order on Alibaba.',
    alternates: { canonical: '/reports' },
    robots: hasParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; industry?: string; sort?: string }>;
}) {
  const { q, industry, sort } = await searchParams;

  const conditions = [eq(reports.status, 'approved')];

  if (industry && industry !== 'All') {
    conditions.push(eq(reports.industry, industry));
  }

  if (q) {
    conditions.push(
      or(
        like(reports.seller_name, `%${q}%`),
        like(reports.product_name, `%${q}%`),
        like(reports.details, `%${q}%`),
        like(reports.industry, `%${q}%`)
      )!
    );
  }

  const orderBy = sort === 'biggest' ? desc(reports.total_price) : desc(reports.created_at);
  const filteredReports = await db
    .select(publicReportColumns)
    .from(reports)
    .where(and(...conditions))
    .orderBy(orderBy);

  const allReports = await db.select().from(reports).where(eq(reports.status, 'approved'));
  const industries = ['All', ...new Set(allReports.map((r) => r.industry))];

  return (
    <div className="page">
      <section style={{ paddingTop: 56, paddingBottom: 30, borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', letterSpacing: '-.03em', marginTop: 10, lineHeight: 1.05 }}>
            {allReports.length} reports of bad <span className="marker" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 600 }}>Alibaba</span> deals.
          </h1>
          <p className="muted" style={{ fontSize: 17, marginTop: 12, maxWidth: 600 }}>
            Search before you wire.
          </p>
          <div style={{ marginTop: 24 }}>
            <SearchBox defaultValue={q || ''} placeholder="Search by seller name, product, or keyword..." />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            <span className="muted small" style={{ marginRight: 4 }}>Industry:</span>
            {industries.map((i) => (
              <Link key={i}
                href={{
                  pathname: '/reports',
                  query: { q, industry: i, sort },
                }}
                className="chip"
                style={{
                  textDecoration: 'none',
                  background: (industry || 'All') === i ? 'var(--ink)' : 'var(--bg-2)',
                  color: (industry || 'All') === i ? 'var(--bg)' : 'var(--ink-2)',
                  borderColor: (industry || 'All') === i ? 'var(--ink)' : 'var(--line-2)',
                }}>
                {i}
              </Link>
            ))}
            <span style={{ flex: 1 }} />
            <span className="muted small">Sort:</span>
            <SortSelect currentSort={sort || 'recent'} />
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 30, paddingBottom: 60 }}>
        <div className="container">
          <div className="muted small" style={{ marginBottom: 16 }}>
            {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
            {q ? <> matching <strong style={{ color: 'var(--ink)' }}>&ldquo;{q}&rdquo;</strong></> : null}
            {(industry && industry !== 'All') ? <> in <strong style={{ color: 'var(--ink)' }}>{industry}</strong></> : null}
          </div>
          {filteredReports.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--card)', border: '1px dashed var(--line-2)', borderRadius: 8 }}>
              <p style={{ fontSize: 16, color: 'var(--ink-2)' }}>No reports match this search.</p>
              <p className="muted small" style={{ marginTop: 6 }}>That&rsquo;s good news for you. Submit one if you have one to share.</p>
              <Link href="/submit-report" className="btn btn-accent" style={{ marginTop: 16 }}>Share Your Story</Link>
            </div>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {filteredReports.map((r) => (
                <ReportRow key={r.id} report={r as Report} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

