'use client';

import React from 'react';
import { Icon } from './Navbar';

export function SearchBox({ defaultValue = '', placeholder = 'Search by seller, product, keyword...' }: { defaultValue?: string; placeholder?: string }) {
  const [q, setQ] = React.useState(defaultValue);
  return (
    <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/reports?q=${encodeURIComponent(q)}`; }}
      style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--card)',
        border: '1px solid var(--line-2)',
        borderRadius: 8,
        padding: '4px 4px 4px 14px',
        minWidth: 320,
        boxShadow: 'var(--shadow-sm)',
      }}>
      <Icon name="search" size={16} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none',
          background: 'transparent', padding: '10px 10px',
          font: 'inherit', fontSize: 14,
        }}
      />
      <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px', fontSize: 13 }}>Search</button>
    </form>
  );
}

import { Report } from '@/lib/reportTypes';
import { formatMoney, relativeDate } from '@/lib/utils';
import Link from 'next/link';

export function ReportRow({ report, images = [] }: { report: Report; images?: string[] }) {
  const r = report;
  return (
    <Link
      href={`/reports/${r.slug}`}
      style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 8, padding: 22,
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform .12s, box-shadow .15s, border-color .15s',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 18,
        textDecoration: 'none',
        color: 'inherit',
      }}
      className="report-row"
    >
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span className="chip">{r.industry}</span>
          <span className="chip chip-mono">{r.platform}</span>
          {r.purchase_verified && (
            <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderColor: 'oklch(0.45 0.12 27)' }}>
              <Icon name="check" size={11} /> Verified
            </span>
          )}
          <span className="muted small">· {relativeDate(r.created_at)}</span>
        </div>
        <h3 style={{ fontSize: 17, letterSpacing: '-.015em', marginBottom: 4 }}>
          {r.seller_name}
        </h3>
        <div className="muted small" style={{ marginBottom: 10 }}>
          {r.product_name} · qty {typeof r.quantity === 'string' ? parseInt(r.quantity).toLocaleString() : r.quantity.toLocaleString()}
        </div>
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.55, maxWidth: 720 }}>
          &ldquo;{r.details.slice(0, 650)}{r.details.length > 650 ? '...' : ''}&rdquo;
        </p>
        {images.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`Evidence photo ${i + 1} from ${r.seller_name} report`}
                loading="lazy"
                style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)', display: 'block', background: 'var(--bg-2)' }}
              />
            ))}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', minWidth: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Lost</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--accent-ink)', fontFamily: 'var(--serif)' }}>
            {formatMoney(r.total_price, r.currency)}
          </div>
          <div className="muted small" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.currency}</div>
        </div>
        <div style={{ color: 'var(--accent-ink)', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 12 }}>
          Read <Icon name="arrow-right" size={15} />
        </div>
      </div>
    </Link>
  );
}
