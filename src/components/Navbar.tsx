import React from 'react';
import Link from 'next/link';

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden>
      !
    </span>
  );
}

export function Brand() {
  return (
    <Link href="/" className="brand">
      <BrandMark />
      <span>scamreports<span style={{ color: 'var(--accent-ink)' }}>.wall</span></span>
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Brand />
        <nav className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/reports" className="nav-link">Browse reports</Link>
          <Link href="/#how" className="nav-link">How it works</Link>
          <Link href="/submit-report" className="btn btn-accent" style={{ padding: '10px 16px', fontSize: 14, marginLeft: 6 }}>
            Share Your Story
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      background: 'var(--bg-2)',
      padding: '40px 0 60px',
      marginTop: 40,
    }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: 360 }}>
          <Brand />
          <p className="muted small" style={{ marginTop: 12, lineHeight: 1.55 }}>
            A community-run wall of fraud reports about bad sellers on overseas wholesale marketplaces. We are not affiliated with Alibaba Group or any other platform. Reports reflect the experiences of the buyers who submitted them.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
          <FooterCol title="The site" links={[
            { label: 'Browse reports', href: '/reports' },
            { label: 'Submit a report', href: '/submit-report' },
            { label: 'How it works', href: '/#how' },
          ]} />
          <FooterCol title="About" links={[
            { label: 'Why this exists', href: '/#why' },
            { label: 'Contact', href: '/contact' },
          ]} />
          <FooterCol title="Legal" links={[
            { label: 'Terms', href: '/terms' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Disclaimer', href: '/disclaimer' },
          ]} />
        </div>
      </div>
      <div className="container" style={{ marginTop: 36, paddingTop: 20, borderTop: '1px dashed var(--line-2)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span className="muted small">© 2026 scamreports.wall — a buyer-run community project.</span>
        <span className="muted small" style={{ fontFamily: 'var(--mono)' }}>Anonymous · Free · Moderated</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-2)', marginBottom: 12 }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((l, i) => (
          <li key={i}>
            <Link className="btn-link" href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FloatingReportButton() {
  return (
    <Link className="float-cta" href="/submit-report">
      <span className="float-cta-dot" />
      Report a seller
    </Link>
  );
}

// Icons — minimal stroke set
export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className };
  switch (name) {
    case 'arrow-right': return (<svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case 'arrow-left': return (<svg {...props}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>);
    case 'search': return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
    case 'shield': return (<svg {...props}><path d="M12 3l8 4v6c0 4.5-3.5 7.5-8 8-4.5-.5-8-3.5-8-8V7l8-4z"/></svg>);
    case 'eye-off': return (<svg {...props}><path d="M3 3l18 18"/><path d="M10.6 6.1A10.5 10.5 0 0 1 12 6c5 0 9 4 10 6-.4.8-1.2 2-2.4 3.2"/><path d="M6.6 6.6C4 8.2 2.5 10.6 2 12c1 2 5 6 10 6 1.4 0 2.7-.3 3.8-.8"/><path d="M14.1 14.1A3 3 0 0 1 9.9 9.9"/></svg>);
    case 'megaphone': return (<svg {...props}><path d="M3 11v2a3 3 0 0 0 3 3h1l3 5 4-1-1-4 8-3V8l-8-3 1-4-4-1-3 5H6a3 3 0 0 0-3 3z"/></svg>);
    case 'check': return (<svg {...props}><path d="M5 12l5 5L20 7"/></svg>);
    case 'lock': return (<svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);
    case 'pencil': return (<svg {...props}><path d="M14 4l6 6L8 22H2v-6L14 4z"/></svg>);
    case 'flag': return (<svg {...props}><path d="M4 22V4h12l-2 4 2 4H4"/></svg>);
    case 'external': return (<svg {...props}><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 13v6H5V5h6"/></svg>);
    case 'clock': return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case 'dollar': return (<svg {...props}><path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H7"/></svg>);
    case 'package': return (<svg {...props}><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4"/><path d="M12 11v10"/></svg>);
    case 'tag': return (<svg {...props}><path d="M3 12V3h9l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>);
    case 'link': return (<svg {...props}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>);
    case 'x': return (<svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case 'camera': return (<svg {...props}><path d="M3 8a2 2 0 0 1 2-2h2l2-3h6l2 3h2a2 2 0 0 1 2 2v11H3V8z"/><circle cx="12" cy="13" r="3.5"/></svg>);
    default: return null;
  }
}
