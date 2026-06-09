import React from 'react';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { Report } from '@/lib/reportTypes';
import { Icon } from '@/components/Navbar';
import { ReportRow } from '@/components/SearchBox';
import { formatMoney, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [report] = await db.select()
    .from(reports)
    .where(and(eq(reports.slug, slug), eq(reports.status, 'approved')))
    .limit(1);

  if (!report) {
    notFound();
  }

  const r = report as Report;

  const related = await db.select()
    .from(reports)
    .where(and(
      eq(reports.status, 'approved'),
      eq(reports.industry, r.industry),
      ne(reports.id, r.id)
    ))
    .limit(3);

  return (
    <div className="page">
      <section style={{ paddingTop: 36, paddingBottom: 40, borderBottom: '1px solid var(--line)' }}>
        <div className="container-narrow">
          <Link href="/reports" className="btn-link">
            <Icon name="arrow-left" size={13} /> Back to all reports
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 18, marginBottom: 14 }}>
            <span className="chip chip-orange">
              <Icon name="flag" size={12} /> Approved report
            </span>
            <span className="chip">{r.industry}</span>
            <span className="chip chip-mono">{r.platform}</span>
            <span className="muted small">· Posted {formatDate(r.created_at)}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-.03em', lineHeight: 1.1, textWrap: 'balance' }}>
            {r.seller_name} — alleged scam report
          </h1>
          <p className="muted" style={{ fontSize: 17, marginTop: 12, lineHeight: 1.5 }}>
            A buyer reported losing {formatMoney(r.total_price, r.currency)} on an order of {r.product_name.toLowerCase()} from this seller. Read the full account below.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 40, paddingBottom: 30 }}>
        <div className="container-narrow">
          {/* Order facts */}
          <div className="paper" style={{ padding: 24, marginBottom: 32, borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 14 }}>
              Order details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 28px' }}>
              <Fact icon="tag" label="Seller" value={r.seller_name} link={r.seller_url} />
              <Fact icon="package" label="Product" value={r.product_name} link={r.product_url} />
              <Fact icon="dollar" label="Total paid" value={`${formatMoney(r.total_price, r.currency)} ${r.currency}`} />
              <Fact icon="package" label="Quantity" value={r.quantity.toLocaleString() + ' units'} />
              <Fact icon="tag" label="Industry" value={r.industry} />
              <Fact icon="clock" label="Reported" value={formatDate(r.created_at)} />
            </div>
          </div>

          {/* Story */}
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.7, color: 'var(--ink)' }}>
            {r.details.split('\n\n').map((p, i) => (
              <p key={i} style={{ margin: '0 0 1.1em' }}>{p}</p>
            ))}
          </div>

          <div style={{ marginTop: 36, padding: 18, background: 'var(--bg-2)', border: '1px dashed var(--line-2)', borderRadius: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--ink-2)' }}>A note on this report.</strong> This is a buyer&rsquo;s account of their own experience. We reviewed it for spam, libel, and verifiable details before publishing — but we cannot confirm every claim. If you&rsquo;re the seller and believe this is inaccurate, <Link href="/contact" className="btn-link">submit a response</Link>.
          </div>

          {/* Inline CTA */}
          <div style={{
            marginTop: 36, padding: 28,
            background: 'linear-gradient(135deg, var(--accent-soft), var(--accent-soft-2))',
            border: '1px solid oklch(0.84 0.10 60)',
            borderRadius: 18,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          }}>
            <div style={{ maxWidth: 420 }}>
              <h3 style={{ fontSize: 20, letterSpacing: '-.02em', color: 'var(--accent-ink)' }}>Got scammed by a different seller?</h3>
              <p className="muted small" style={{ marginTop: 6, lineHeight: 1.5 }}>It takes about 5 minutes. No account needed. Anonymous.</p>
            </div>
            <Link href="/submit-report" className="btn btn-accent">Share Your Story</Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ paddingTop: 30, paddingBottom: 60, background: 'var(--bg-2)', borderTop: '1px solid var(--line)' }}>
          <div className="container-narrow">
            <span className="eyebrow">More in {r.industry}</span>
            <h2 style={{ fontSize: 24, marginTop: 10, letterSpacing: '-.02em', marginBottom: 18 }}>Other reports in this category</h2>
            <div className="stack" style={{ gap: 10 }}>
              {related.map((x) => (
                <ReportRow key={x.id} report={x as Report} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Fact({ icon, label, value, link }: { icon: string; label: string; value: string; link?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={icon} size={12} /> {label}
      </div>
      <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.4 }}>
        {value}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent-ink)', marginLeft: 6, fontSize: 12 }}>
            <Icon name="external" size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
