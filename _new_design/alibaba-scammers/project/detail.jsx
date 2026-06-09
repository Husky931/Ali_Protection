// Per-report detail page — SEO-shaped, structured data, story body.

function Detail({ navigate, id }) {
  const r = window.REPORTS.find((x) => x.id === id) || window.REPORTS[0];
  const related = window.REPORTS.filter((x) => x.id !== r.id && x.industry === r.industry).slice(0, 3);

  return (
    <div className="page">
      <section style={{ paddingTop: 36, paddingBottom: 40, borderBottom: '1px solid var(--line)' }}>
        <div className="container-narrow">
          <button className="btn-link" onClick={() => navigate('browse')}>
            <Icon name="arrow-left" size={13} /> Back to all reports
          </button>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 18, marginBottom: 14 }}>
            <span className="chip chip-orange">
              <Icon name="flag" size={12} /> Approved report
            </span>
            <span className="chip">{r.industry}</span>
            <span className="chip chip-mono">{r.platform}</span>
            <span className="muted small">· Posted {window.formatDate(r.createdAt)}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-.03em', lineHeight: 1.1, textWrap: 'balance' }}>
            {r.sellerName} — alleged scam report
          </h1>
          <p className="muted" style={{ fontSize: 17, marginTop: 12, lineHeight: 1.5 }}>
            A buyer reported losing {window.formatMoney(r.totalPaid, r.currency)} on an order of {r.productName.toLowerCase()} from this seller. Read the full account below.
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
              <Fact icon="tag" label="Seller" value={r.sellerName} link={r.sellerUrl} />
              <Fact icon="package" label="Product" value={r.productName} link={r.productUrl} />
              <Fact icon="dollar" label="Total paid" value={`${window.formatMoney(r.totalPaid, r.currency)} ${r.currency}`} />
              <Fact icon="package" label="Quantity" value={r.quantity.toLocaleString() + ' units'} />
              <Fact icon="tag" label="Industry" value={r.industry} />
              <Fact icon="clock" label="Reported" value={window.formatDate(r.createdAt)} />
            </div>
          </div>

          {/* Story */}
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.7, color: 'var(--ink)' }}>
            {r.story.split('\n\n').map((p, i) => (
              <p key={i} style={{ margin: '0 0 1.1em' }}>{p}</p>
            ))}
          </div>

          <div style={{ marginTop: 36, padding: 18, background: 'var(--bg-2)', border: '1px dashed var(--line-2)', borderRadius: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--ink-2)' }}>A note on this report.</strong> This is a buyer&rsquo;s account of their own experience. We reviewed it for spam, libel, and verifiable details before publishing — but we cannot confirm every claim. If you&rsquo;re the seller and believe this is inaccurate, <a href="#" className="btn-link">submit a response</a>.
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
            <button className="btn btn-accent" onClick={() => navigate('submit')}>Share Your Story</button>
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
                <window.ReportRow key={x.id} report={x} onOpen={() => navigate({ name: 'detail', id: x.id })} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Fact({ icon, label, value, link }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={icon} size={12} /> {label}
      </div>
      <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.4 }}>
        {value}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.preventDefault()}
            style={{ color: 'var(--accent-ink)', marginLeft: 6, fontSize: 12 }}>
            <Icon name="external" size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

window.Detail = Detail;
