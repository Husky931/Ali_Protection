import React from 'react';
import { Icon } from '@/components/Navbar';
import { HeroMock } from '@/components/HeroMock';
import { SearchBox, ReportRow } from '@/components/SearchBox';
import Link from 'next/link';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Report } from '@/lib/reportTypes';

export default async function LandingPage() {
  const recentReports = await db.select()
    .from(reports)
    .where(eq(reports.status, 'approved'))
    .orderBy(desc(reports.created_at))
    .limit(4);

  const totalReportsCount = await db.$count(reports, eq(reports.status, 'approved'));

  return (
    <div className="page">
      <Hero totalCount={totalReportsCount} />
      <WhySection />
      <HowItWorks />
      <FeedPreview reports={recentReports as Report[]} />
      <CTAStrip />
    </div>
  );
}

function Hero({ totalCount }: { totalCount: number }) {
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
            Share your story. Protect others from fraudulent sellers.  Bad sellers should not get repeated business.
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
        <div style={{ position: 'relative', minHeight: 420 }}>
          <HeroMock />
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

function FeedPreview({ reports }: { reports: Report[] }) {
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
            <ReportRow key={r.id} report={r} />
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
    <section style={{ padding: '90px 0', background: 'var(--ink)', color: '#fff' }}>
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
