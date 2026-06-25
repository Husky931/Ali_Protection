import React from 'react';
import { HeroImage } from '@/components/HeroImage';
import { Icon } from '@/components/Navbar';
import { SearchBox, ReportRow } from '@/components/SearchBox';
import Link from 'next/link';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Report } from '@/lib/reportTypes';
import { publicReportColumns } from '@/lib/reportSelect';
import { getEvidenceUrlsByReport } from '@/lib/reportImages';

// The homepage feed reads newly-approved reports from the DB. Without this it is
// statically prerendered at build time and never reflects reports approved after
// a deploy (the bug where /reports showed a report but the homepage stayed empty).
// ISR: serve a cached page but regenerate at most once a minute so new approvals
// surface quickly while crawlers still get a fast, cacheable response.
export const revalidate = 60;

export default async function LandingPage() {
  const recentReports = await db.select(publicReportColumns)
    .from(reports)
    .where(eq(reports.status, 'approved'))
    .orderBy(desc(reports.created_at))
    .limit(20);

  const totalReportsCount = await db.$count(reports, eq(reports.status, 'approved'));
  const imagesByReport = await getEvidenceUrlsByReport(recentReports.map((r) => r.id));

  return (
    <div className="page">
      <Hero totalCount={totalReportsCount} />
      <WhySection />
      {/* <HowItWorks /> */}
      <FAQSection />
      <FeedPreview reports={recentReports as Report[]} imagesByReport={imagesByReport} />
      <CTAStrip />
    </div>
  );
}

function Hero({ totalCount }: { totalCount: number }) {
  return (
    <section id="hero" style={{
      paddingTop: 0, paddingBottom: 0,
      background: 'radial-gradient(1200px 600px at 110% -10%, oklch(0.40 0.12 27 / .35), transparent 60%), radial-gradient(900px 500px at -10% 40%, oklch(0.30 0.09 27 / .30), transparent 60%)',
      borderBottom: '1px solid var(--line)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="container" style={{
        display: 'grid',
        alignItems: 'stretch',
      }}>
        <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span className="chip chip-orange">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)' }} />
              {totalCount} reports published
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
            A community list of reported Alibaba scammers, built from real buyer reports. The image on the right tells the whole story: a real Alibaba seller with multiple 1-star reviews that the overall rating hides.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link href="/submit-report" className="btn btn-accent">
              <Icon name="megaphone" size={16} /> Share Your Story
            </Link>
            <Link href="/reports" className="btn btn-ghost">
              <Icon name="search" size={16} /> Browse Reports
            </Link>
          </div>
        </div>
        <div className="hero-media" style={{ position: 'relative', alignSelf: 'stretch', display: 'flex' }}>
          <HeroImage
            src="/hero-alibaba.png"
            alt="A real Alibaba supplier profile — a 4.8-star rating and glowing reviews circled — the kind of listing that buries buyer complaints."
            width={1250}
            height={1464}
            sizes="(max-width: 1220px) 100vw, 640px"
          />
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon, text }: { icon: string; text: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={14} /> {text}
    </span>
  );
}

function WhySection() {
  return (
    <section id="why" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
      <div className="container" style={{ display: 'grid' }}>
        <div>
          <h2 style={{ marginTop: 12, letterSpacing: '-.025em', lineHeight: 1.15, textWrap: 'balance', textAlign: 'center' }}>
            I got scammed on Alibaba.
          </h2>
        </div>
        <div data-nosnippet style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: 580 }}>
          <p style={{ marginTop: 0 }}>The Trade Assurance is a scam and the Dispute Resolution Process is biased. I&rsquo;ve had a dispute going for months over counterfeit 18kt gold, counterfeit platinum, fake Moissanite, and fraudulent copies of GRA certificates. It&rsquo;s cost me nearly $10,000 in products, testing equipment, independent valuations, and import tax.</p>
          <p style={{ marginBottom: 0 }}>The jewellery delivered was nothing more than cheap costume jewellery. Despite the overwhelming evidence I provided — the days and nights I sat photographing every test on every piece — the metal was made of god knows what, the Moissanite nothing but well-cut glass, all of it stamped AU750 or PL950 so it would pass as the real thing&hellip;</p>
          <p style={{ marginTop: 22 }}>
            <Link href="/reports/quanzhou-pushi-jewellery-18k-gold-platinum-moissanite-jewelry" style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Read the full report on Quanzhou Pushi Jewellery <Icon name="arrow-right" size={14} />
            </Link>
          </p>
          <p style={{ marginTop: 12, marginBottom: 0, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', fontStyle: 'normal' }}>— A buyer&rsquo;s report, published on alibabascammer.com</p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: 'Is Alibaba a scam?',
      a: (
        <>
          Alibaba itself is a legitimate marketplace, but it&rsquo;s full of individual scam sellers. The risk isn&rsquo;t the platform &mdash; it&rsquo;s the supplier you wire money to. That&rsquo;s why buyers search a seller&rsquo;s name before ordering, and why we keep a public{' '}
          <Link href="/reports" className="btn-link">list of reported Alibaba scammers</Link>.
        </>
      ),
    },
    {
      q: 'How do I check if an Alibaba seller is a scammer?',
      a: (
        <>
          Search the seller&rsquo;s company name on our{' '}
          <Link href="/reports" className="btn-link">Alibaba scammer list</Link>{' '}
          first &mdash; it collects real buyer reports, so if someone&rsquo;s been burned by that seller you&rsquo;ll see it. Then read{' '}
          <Link href="/guides/how-to-avoid-alibaba-scams" className="btn-link">how to avoid Alibaba scams</Link>{' '}
          for the red flags to check before you pay.
        </>
      ),
    },
    {
      q: 'How do I report an Alibaba scammer?',
      a: (
        <>
          <Link href="/submit-report" className="btn-link">Submit a report</Link>{' '}
          &mdash; it&rsquo;s anonymous and takes about five minutes. A moderator reviews every submission before it&rsquo;s published, so your report becomes a public warning for the next buyer who searches that seller.
        </>
      ),
    },
    {
      q: 'I got scammed on Alibaba — what now?',
      a: (
        <>
          Stop sending money and document everything. Our guide on{' '}
          <Link href="/guides/is-alibaba-safe" className="btn-link">whether Alibaba is safe</Link>{' '}
          walks through Trade Assurance disputes and chargebacks. Then{' '}
          <Link href="/submit-report" className="btn-link">report the seller</Link>{' '}
          so other buyers can find your account when they search.
        </>
      ),
    },
  ];
  return (
    <section id="faq" style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
      <div className="container">
        <div style={{ maxWidth: 580, marginBottom: 36 }}>
          <span className="eyebrow">FAQ</span>
          <h2 style={{ fontSize: 32, marginTop: 12, letterSpacing: '-.025em', lineHeight: 1.15 }}>
            Alibaba scams, answered.
          </h2>
        </div>
        <div className="stack" style={{ gap: 0 }}>
          {faqs.map((f) => (
            <div key={f.q} style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
              <h3 style={{ fontSize: 18, letterSpacing: '-.015em', marginBottom: 8 }}>{f.q}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, maxWidth: 720 }}>{f.a}</p>
            </div>
          ))}
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
      title: 'Goes public',
      body: 'You might not be able to get your money back, but at least the sellers bad deeds will be out in the open and it might cost them some business in the future. ',
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
              borderRadius: 8,
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
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--bg)', border: '1px solid var(--line)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--ink-2)',
                }}>
                  <Icon name={s.icon} size={18} />
                </span>
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8, letterSpacing: '-.015em' }}>{s.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeedPreview({ reports, imagesByReport }: { reports: Report[]; imagesByReport: Map<string, string[]> }) {
  return (
    <section id="feed" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 580 }}>
            <h2 style={{ fontSize: 32, marginTop: 12, letterSpacing: '-.025em', lineHeight: 1.15 }}>
              Search any seller before you wire money.
            </h2>
          </div>
          <SearchBox />
        </div>
        <div className="stack" style={{ gap: 12 }}>
          {reports.map((r) => (
            <ReportRow key={r.id} report={r} images={imagesByReport.get(r.id)} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/reports" className="btn btn-ghost">
            See all reports <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTAStrip() {
  return (
    <section style={{ padding: '90px 0', background: 'linear-gradient(135deg, oklch(0.34 0.11 27), oklch(0.21 0.06 27))', color: '#fff' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
        <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', marginTop: 14, letterSpacing: '-.03em', lineHeight: 1.1, textWrap: 'balance' }}>
          Your story can save the next buyer thousands.
        </h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 17, marginTop: 16, lineHeight: 1.5 }}>
          Five minutes of writing puts your scam seller&rsquo;s company name out in the open.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <Link href="/submit-report" className="btn btn-accent">
            Share Your Story <Icon name="arrow-right" size={14} />
          </Link>
          <Link href="/reports" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.25)' }}>
            Browse reports first
          </Link>
        </div>
      </div>
    </section>
  );
}
