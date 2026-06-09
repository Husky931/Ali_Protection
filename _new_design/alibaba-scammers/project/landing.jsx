// Landing page composition.

function Landing({ navigate, tweaks }) {
  React.useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="page">
      <Hero navigate={navigate} />
      <WhySection />
      <HowItWorks />
      <FeedPreview navigate={navigate} />
      <CTAStrip navigate={navigate} />
    </div>
  );
}

function Hero({ navigate }) {
  return (
    <section style={{
      paddingTop: 70, paddingBottom: 100,
      background: 'radial-gradient(1200px 600px at 110% -10%, oklch(0.94 0.07 65 / .8), transparent 60%), radial-gradient(900px 500px at -10% 40%, oklch(0.96 0.04 75 / .7), transparent 60%)',
      borderBottom: '1px solid var(--line)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="container" style={{
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60,
        alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span className="chip chip-orange">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)' }} />
              247 reports · {window.REPORTS.length} new this week
            </span>
          </div>
          <h1 className="display">
            The place on the web to report a bad{' '}
            <span className="marker" style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 600 }}>Alibaba</span>{' '}
            deal.
          </h1>
          <p style={{
            fontSize: 19, color: 'var(--ink-2)',
            marginTop: 22, maxWidth: 520, lineHeight: 1.5,
          }}>
            Share your story. Protect others from fraudulent sellers. Anonymous, free, and moderated — every report is reviewed before it goes public.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn btn-accent" onClick={() => navigate('submit')}>
              <Icon name="megaphone" size={16} /> Share Your Story
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('browse')}>
              <Icon name="search" size={16} /> Browse Reports
            </button>
          </div>
          <div style={{ display: 'flex', gap: 22, marginTop: 30, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 13 }}>
            <TrustItem icon="lock" text="Anonymous — no account" />
            <TrustItem icon="shield" text="Moderated by humans" />
            <TrustItem icon="check" text="Free and ad-free" />
          </div>
        </div>
        <div style={{ position: 'relative', minHeight: 420 }}>
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={14} /> {text}
    </span>
  );
}

function WhySection() {
  return (
    <section id="why" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 64, alignItems: 'flex-start' }}>
        <div>
          <span className="eyebrow">Why this site exists</span>
          <h2 style={{ fontSize: 32, marginTop: 12, letterSpacing: '-.025em', lineHeight: 1.15, textWrap: 'balance' }}>
            I got scammed on Alibaba. Here&rsquo;s what happened, and why I built this.
          </h2>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: 580 }}>
          <p style={{ marginTop: 0 }}>In 2024 I wired $4,200 to a verified Gold Supplier for a thousand LED bulbs. The samples were perfect. The bulk shipment never came. Tracking went dead the day after I paid the balance.</p>
          <p>Trade Assurance asked for documents I&rsquo;d already submitted twice, then closed the dispute because I &ldquo;missed a 72-hour response window.&rdquo; The seller&rsquo;s 4.9-star rating never moved. New buyers had no way of knowing.</p>
          <p>I asked around. Everyone I talked to had a story like this — or knew someone who did. The marketplace has every incentive to make those stories invisible. Buyers have nowhere to put them.</p>
          <p style={{ marginBottom: 0 }}>So this is the wall. If you got burned, post it. Help the next person Google before they wire.</p>
          <p style={{ marginTop: 18, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', fontStyle: 'normal' }}>— J., the buyer who started this</p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit your report',
      body: 'Anonymously share what happened: the seller, the order, the amount, and the story. No account needed.',
      icon: 'pencil',
    },
    {
      num: '02',
      title: 'A human reviews it',
      body: 'Every submission is read by a moderator before it goes public. Spam, libel, and unverifiable claims are filtered out.',
      icon: 'shield',
    },
    {
      num: '03',
      title: 'Goes public, gets indexed',
      body: 'Your report lives at its own URL with the seller&rsquo;s name, so the next buyer searching for them sees it.',
      icon: 'megaphone',
    },
  ];
  return (
    <section id="how" style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
      <div className="container">
        <div style={{ marginBottom: 44, maxWidth: 580 }}>
          <span className="eyebrow">How it works</span>
          <h2 style={{ fontSize: 36, marginTop: 12, letterSpacing: '-.03em', lineHeight: 1.1 }}>
            Three steps. No accounts. No spam.
          </h2>
        </div>
        <div className="grid-3">
          {steps.map((s) => (
            <div key={s.num} style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 18,
              padding: 26,
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <span style={{
                  fontFamily: 'var(--serif)', fontStyle: 'italic',
                  fontSize: 38, fontWeight: 600, color: 'var(--accent)',
                  lineHeight: 1,
                }}>{s.num}</span>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--bg)', border: '1px solid var(--line)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--ink-2)',
                }}>
                  <Icon name={s.icon} size={18} />
                </span>
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8, letterSpacing: '-.015em' }}>{s.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}
                dangerouslySetInnerHTML={{ __html: s.body }} />
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24, color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
          <Icon name="lock" size={13} /> reCAPTCHA-protected · Rate-limited · No tracking pixels
        </p>
      </div>
    </section>
  );
}

function FeedPreview({ navigate }) {
  const recent = window.REPORTS.slice(0, 4);
  return (
    <section id="feed" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 580 }}>
            <span className="eyebrow">Recent reports</span>
            <h2 style={{ fontSize: 32, marginTop: 12, letterSpacing: '-.025em', lineHeight: 1.15 }}>
              Search any seller before you wire money.
            </h2>
          </div>
          <SearchBox onSubmit={(q) => navigate({ name: 'browse', query: q })} />
        </div>
        <div className="stack" style={{ gap: 12 }}>
          {recent.map((r) => (
            <ReportRow key={r.id} report={r} onOpen={() => navigate({ name: 'detail', id: r.id })} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn btn-ghost" onClick={() => navigate('browse')}>
            See all reports <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function SearchBox({ onSubmit, defaultValue = '', placeholder = 'Search by seller, product, keyword...' }) {
  const [q, setQ] = React.useState(defaultValue);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(q); }}
      style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--card)',
        border: '1px solid var(--line-2)',
        borderRadius: 12,
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

function ReportRow({ report, onOpen }) {
  const r = report;
  return (
    <article
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
      style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, padding: 22,
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform .12s, box-shadow .15s, border-color .15s',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 18,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span className="chip">{r.industry}</span>
          <span className="chip chip-mono">{r.platform}</span>
          <span className="muted small">· {window.relativeDate(r.createdAt)}</span>
        </div>
        <h3 style={{ fontSize: 17, letterSpacing: '-.015em', marginBottom: 4 }}>
          {r.sellerName}
        </h3>
        <div className="muted small" style={{ marginBottom: 10 }}>
          {r.productName} · qty {r.quantity.toLocaleString()}
        </div>
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.55, maxWidth: 720 }}>
          &ldquo;{r.snippet}&rdquo;
        </p>
      </div>
      <div style={{ textAlign: 'right', minWidth: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Lost</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--accent-ink)', fontFamily: 'var(--serif)' }}>
            {window.formatMoney(r.totalPaid, r.currency)}
          </div>
          <div className="muted small" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.currency}</div>
        </div>
        <div className="small" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 12 }}>
          Read <Icon name="arrow-right" size={13} />
        </div>
      </div>
    </article>
  );
}

function CTAStrip({ navigate }) {
  return (
    <section style={{ padding: '90px 0', background: 'var(--ink)', color: '#fff' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
        <span className="eyebrow" style={{ color: 'var(--accent)' }}>Got burned?</span>
        <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', marginTop: 14, letterSpacing: '-.03em', lineHeight: 1.1, textWrap: 'balance' }}>
          Your story can save the next buyer thousands.
        </h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 17, marginTop: 16, lineHeight: 1.5 }}>
          Five minutes of writing makes your seller&rsquo;s scam Googleable. That&rsquo;s the whole game.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <button className="btn btn-accent" onClick={() => navigate('submit')}>
            Share Your Story <Icon name="arrow-right" size={14} />
          </button>
          <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.25)' }} onClick={() => navigate('browse')}>
            Browse reports first
          </button>
        </div>
      </div>
    </section>
  );
}

window.Landing = Landing;
window.SearchBox = SearchBox;
window.ReportRow = ReportRow;
