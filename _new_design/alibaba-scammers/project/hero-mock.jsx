// Hero illustration: a generic seller-listing mockup with bad reviews redacted/hidden,
// annotated to show the thesis "platforms hide bad ratings".
// This is an ORIGINAL UI mock — not a recreation of any real platform's chrome.

function HeroMock() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Tape on top */}
      <span className="tape" />
      <div className="paper" style={{
        position: 'relative',
        padding: 22,
        transform: 'rotate(-1.2deg)',
        background: '#fffdf8',
      }}>
        {/* Faux browser chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          paddingBottom: 10, borderBottom: '1px solid var(--line)',
          marginBottom: 14,
        }}>
          <span style={dot('#e5564b')} />
          <span style={dot('#e5b13f')} />
          <span style={dot('#5fbb5f')} />
          <div style={{
            marginLeft: 10, flex: 1,
            background: 'var(--bg-2)', borderRadius: 6,
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
            padding: '5px 10px',
          }}>
            wholesale-marketplace.example/sellers/glowtech-3920
          </div>
        </div>

        {/* Listing header */}
        <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 88, height: 88, borderRadius: 12,
            background: 'repeating-linear-gradient(135deg, #e8e2d3, #e8e2d3 6px, #ddd5c2 6px, #ddd5c2 12px)',
            border: '1px solid var(--line-2)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)',
            textAlign: 'center', padding: 4,
          }}>
            seller<br />logo
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 18, letterSpacing: '-.01em' }}>Shenzhen GlowTech Electronics Co., Ltd.</h3>
              <span style={{
                background: 'oklch(0.92 0.10 90)',
                color: 'oklch(0.42 0.12 70)',
                padding: '2px 8px', borderRadius: 4,
                fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
              }}>VERIFIED · 3 YRS</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
              <span><span style={{ color: '#d4a017', fontSize: 13 }}>★★★★★</span> 4.9 / 5.0</span>
              <span>· 1,284 transactions</span>
              <span>· On-time: 98%</span>
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: '16px 0' }} />

        {/* Reviews section, with bad ones hidden */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Recent reviews</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>showing 3 of 247</span>
          </div>
          <ReviewRow stars={5} text="Great communication, fast shipping. Will order again." visible />
          <ReviewRow stars={5} text="Exactly as described. Recommended for bulk orders." visible />
          <ReviewRow stars={4} text="Good quality, slight delay on shipping." visible />
          <ReviewRow stars={1} text={"Wired the deposit, never got the goods. Seller went silent."} hidden />
          <ReviewRow stars={1} text={"Counterfeit packaging. Trade Assurance refused dispute."} hidden />
          <ReviewRow stars={2} text={"Half the order missing. Demanded extra payment to resolve."} hidden />

          {/* "Show all" link, deliberately tiny */}
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--muted-2)', textDecoration: 'underline' }}>
              Show all 247 reviews
            </span>
          </div>
        </div>
      </div>

      {/* Annotation arrows */}
      <Annotation
        style={{ top: '46%', right: -18, transform: 'translateX(100%) rotate(2deg)' }}
        text={'These three reports never\nappear in the seller score'}
      />
      <Annotation
        style={{ top: 22, left: -32, transform: 'translateX(-100%) rotate(-3deg)' }}
        text={'5-star average,\nno red flags shown'}
        flipped
      />
    </div>
  );
}

function dot(color) {
  return {
    width: 10, height: 10, borderRadius: '50%',
    background: color, border: '1px solid rgba(0,0,0,.08)',
    display: 'inline-block',
  };
}

function ReviewRow({ stars, text, visible, hidden }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '60px 1fr',
      gap: 10, padding: '8px 0',
      borderBottom: '1px dashed var(--line)',
      alignItems: 'center',
    }}>
      <span style={{
        fontSize: 12,
        color: visible ? '#d4a017' : 'transparent',
        letterSpacing: 1,
        position: 'relative',
        filter: hidden ? 'blur(4px)' : 'none',
        background: hidden ? 'rgba(120,120,120,.18)' : 'transparent',
        borderRadius: 3,
      }}>{'★'.repeat(stars) + '☆'.repeat(5 - stars)}</span>
      <span style={{
        fontSize: 12,
        color: hidden ? 'transparent' : 'var(--ink-2)',
        background: hidden ? 'rgba(120,120,120,.18)' : 'transparent',
        borderRadius: 4,
        position: 'relative',
        padding: hidden ? '2px 6px' : 0,
      }}>
        {hidden ? '████ ████████ ██████ ███████ ███ ████████.' : text}
        {hidden && (
          <span style={{
            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
            fontSize: 9, fontFamily: 'var(--mono)', color: 'oklch(0.45 0.18 28)',
            background: '#fff', padding: '1px 5px', borderRadius: 3,
            border: '1px solid oklch(0.85 0.10 30)',
            letterSpacing: '.05em',
          }}>HIDDEN</span>
        )}
      </span>
    </div>
  );
}

function Annotation({ text, style, flipped }) {
  return (
    <div style={{
      position: 'absolute',
      maxWidth: 180,
      fontFamily: 'var(--serif)',
      fontStyle: 'italic',
      fontSize: 14,
      color: 'var(--accent-ink)',
      lineHeight: 1.35,
      whiteSpace: 'pre-line',
      ...style,
    }}>
      <span>{text}</span>
      <svg width="60" height="34" viewBox="0 0 60 34" style={{
        position: 'absolute',
        [flipped ? 'right' : 'left']: flipped ? -50 : -50,
        bottom: -28,
        transform: flipped ? 'scaleX(-1) rotate(8deg)' : 'rotate(-8deg)',
      }}>
        <path d="M2 4 C 20 8, 35 18, 55 30" stroke="oklch(0.55 0.18 45)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeDasharray="0" />
        <path d="M50 24 L 55 30 L 47 32" stroke="oklch(0.55 0.18 45)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

window.HeroMock = HeroMock;
