"use client";

import React, { useRef, useState } from "react";
import { Icon } from "./Navbar";
import { INDUSTRIES, CURRENCIES, PLATFORMS } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import ReCAPTCHA from "react-google-recaptcha";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

const initialState = {
  seller_name: '',
  seller_url: '',
  platform: 'Alibaba.com',
  product_name: '',
  product_url: '',
  quantity: '',
  total_price: '',
  currency: 'USD',
  industry: '',
  details: '',
};

export function ReportForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const captchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [k]: e.target.value });
  };

  const steps = [
    { num: '01', label: 'Seller' },
    { num: '02', label: 'Order' },
    { num: '03', label: 'Story' },
    { num: '04', label: 'Review' },
  ];

  const stepValid = [
    form.seller_name.trim() && form.seller_url.trim(),
    form.product_name.trim() && form.quantity && form.total_price && form.industry,
    form.details.trim().length > 60,
    true,
  ];

  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMessage("");

    const captchaToken = captchaRef.current?.getValue();
    if (!captchaToken) {
      setStatus("error");
      setErrorMessage("Please complete the captcha.");
      return;
    }

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        total_price: Number(form.total_price),
        captchaToken,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus("error");
      setErrorMessage(payload?.error || "Could not submit report.");
      captchaRef.current?.reset();
      return;
    }

    setStatus("success");
    setStep(4);
  };

  if (step === 4) return <Submitted onReset={() => { setForm(initialState); setStep(0); setStatus("idle"); }} />;

  return (
    <div className="container-narrow">
      <div style={{ marginTop: 18, marginBottom: 10 }}>
        <span className="eyebrow">Submit a report</span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', letterSpacing: '-.03em', marginTop: 10, lineHeight: 1.1 }}>
          Tell us what happened.
        </h1>
        <p className="muted" style={{ fontSize: 16, marginTop: 10, lineHeight: 1.5 }}>
          Anonymous. Reviewed by a human before going public. Takes about 5 minutes.
        </p>
      </div>

      {/* Stepper */}
      <div style={{
        display: 'flex', gap: 0, alignItems: 'stretch', marginTop: 30, marginBottom: 30,
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 6,
      }}>
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} style={{ flex: 1, position: 'relative' }}>
              <button
                disabled={i > step}
                onClick={() => i <= step && setStep(i)}
                style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 2, padding: '10px 14px',
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? '#fff' : (done ? 'var(--ink)' : 'var(--muted)'),
                  border: 'none', borderRadius: 10,
                  cursor: i <= step ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.06em',
                  color: active ? 'var(--accent)' : (done ? 'var(--accent-ink)' : 'var(--muted-2)'),
                }}>
                  {done ? '✓ DONE' : s.num}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="paper" style={{ padding: 32 }}>
        {step === 0 && <StepSeller form={form} handleChange={handleChange} />}
        {step === 1 && <StepOrder form={form} handleChange={handleChange} />}
        {step === 2 && <StepStory form={form} handleChange={handleChange} />}
        {step === 3 && (
          <>
            <StepReview form={form} jump={setStep} />
            {siteKey && (
              <div style={{ marginTop: 24 }}>
                <ReCAPTCHA ref={captchaRef} sitekey={siteKey} />
              </div>
            )}
            {errorMessage && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-2)', color: 'var(--danger)', borderRadius: 8, fontSize: 13 }}>
                {errorMessage}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}
          style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
          <Icon name="arrow-left" size={14} /> Back
        </button>
        {step < 3 ? (
          <button className="btn btn-primary" disabled={!stepValid[step]} onClick={() => setStep(step + 1)}
            style={{ opacity: stepValid[step] ? 1 : 0.4 }}>
            Continue <Icon name="arrow-right" size={14} />
          </button>
        ) : (
          <button className="btn btn-accent" onClick={handleSubmit} disabled={status === "loading"}>
            {status === "loading" ? "Submitting..." : "Submit report"} <Icon name="check" size={14} />
          </button>
        )}
      </div>

      <p className="muted small" style={{ marginTop: 24, textAlign: 'center' }}>
        <Icon name="lock" size={12} /> Submissions are anonymous, rate-limited, and reCAPTCHA-protected.
      </p>
    </div>
  );
}

function StepSeller({ form, handleChange }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 22, letterSpacing: '-.02em', marginBottom: 6 }}>Who scammed you?</h2>
      <p className="muted small" style={{ marginBottom: 22 }}>The seller&rsquo;s name and store link from the marketplace.</p>
      <div className="field">
        <label className="label">Seller name <span className="label-hint">as it appears on the platform</span></label>
        <input className="input" value={form.seller_name} onChange={handleChange('seller_name')} placeholder="e.g. Shenzhen GlowTech Electronics Co., Ltd." />
      </div>
      <div className="field">
        <label className="label">Seller store URL</label>
        <input className="input" value={form.seller_url} onChange={handleChange('seller_url')} placeholder="https://..." />
      </div>
      <div className="field">
        <label className="label">Platform</label>
        <select className="select" value={form.platform} onChange={handleChange('platform')}>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
}

function StepOrder({ form, handleChange }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 22, letterSpacing: '-.02em', marginBottom: 6 }}>The order.</h2>
      <p className="muted small" style={{ marginBottom: 22 }}>What you bought and what it cost you.</p>
      <div className="field">
        <label className="label">Product name</label>
        <input className="input" value={form.product_name} onChange={handleChange('product_name')} placeholder="e.g. A19 Smart LED Bulbs (1000-pack)" />
      </div>
      <div className="field">
        <label className="label">Product URL <span className="label-hint">optional</span></label>
        <input className="input" value={form.product_url} onChange={handleChange('product_url')} placeholder="https://..." />
      </div>
      <div className="grid-2">
        <div className="field">
          <label className="label">Quantity</label>
          <input type="number" className="input" value={form.quantity} onChange={handleChange('quantity')} placeholder="100" />
        </div>
        <div className="field">
          <label className="label">Industry</label>
          <select className="select" value={form.industry} onChange={handleChange('industry')}>
            <option value="">Select...</option>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label className="label">Total paid</label>
          <input type="number" className="input" value={form.total_price} onChange={handleChange('total_price')} placeholder="4280" />
        </div>
        <div className="field">
          <label className="label">Currency</label>
          <select className="select" value={form.currency} onChange={handleChange('currency')}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepStory({ form, handleChange }: any) {
  const len = form.details.length;
  return (
    <div>
      <h2 style={{ fontSize: 22, letterSpacing: '-.02em', marginBottom: 6 }}>What happened?</h2>
      <p className="muted small" style={{ marginBottom: 22 }}>Tell it like you&rsquo;re telling a friend. Short paragraphs are fine. The more specific you are, the more useful this is to the next buyer.</p>
      <div className="field">
        <textarea className="textarea" value={form.details} onChange={handleChange('details')}
          style={{ minHeight: 260, fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.6 }}
          placeholder={"I wired the deposit on March 12. The seller had a Gold rating and a three-year history...\n\nA week later, I got a tracking number that worked for one day, then went dead..."} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="muted small">Min 60 characters · {len < 60 ? `${60 - len} to go` : 'looks good'}</span>
          <span className="muted small">{len} characters</span>
        </div>
      </div>
      <div style={{ background: 'var(--bg-2)', border: '1px dashed var(--line-2)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
        <strong style={{ color: 'var(--ink-2)' }}>Tips:</strong> Include the timeline, the dispute outcome, and any responses from the seller. Don&rsquo;t include personal info (your real name, payment details, anything you wouldn&rsquo;t want public).
      </div>
    </div>
  );
}

function StepReview({ form, jump }: any) {
  const Field = ({ label, value, onEdit }: any) => (
    <div style={{ padding: '12px 0', borderBottom: '1px dashed var(--line)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14.5, color: 'var(--ink)' }}>{value || <span className="muted">—</span>}</div>
      </div>
      <button className="btn-link small" onClick={onEdit}>Edit</button>
    </div>
  );
  return (
    <div>
      <h2 style={{ fontSize: 22, letterSpacing: '-.02em', marginBottom: 6 }}>Look it over.</h2>
      <p className="muted small" style={{ marginBottom: 22 }}>Once you submit, a moderator will review within 48 hours. You won&rsquo;t hear back unless we have questions.</p>
      <div>
        <Field label="Seller name" value={form.seller_name} onEdit={() => jump(0)} />
        <Field label="Seller URL" value={form.seller_url} onEdit={() => jump(0)} />
        <Field label="Product" value={form.product_name} onEdit={() => jump(1)} />
        <Field label="Quantity" value={form.quantity ? Number(form.quantity).toLocaleString() : ''} onEdit={() => jump(1)} />
        <Field label="Total paid" value={form.total_price ? `${formatMoney(Number(form.total_price), form.currency)} ${form.currency}` : ''} onEdit={() => jump(1)} />
        <Field label="Industry" value={form.industry} onEdit={() => jump(1)} />
        <div style={{ padding: '12px 0', borderBottom: '1px dashed var(--line)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: 4 }}>Story</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.55, whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto' }}>
              {form.details || <span className="muted">—</span>}
            </div>
          </div>
          <button className="btn-link small" onClick={() => jump(2)}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function Submitted({ onReset }: { onReset: () => void }) {
  return (
    <section style={{ paddingTop: 80, paddingBottom: 100, textAlign: 'center' }}>
      <div className="container-narrow">
        <div style={{
          width: 72, height: 72, borderRadius: 999, margin: '0 auto 24px',
          background: 'var(--accent-soft)', color: 'var(--accent-ink)',
          display: 'grid', placeItems: 'center',
          border: '2px solid oklch(0.84 0.10 60)',
        }}>
          <Icon name="check" size={32} />
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-.03em', lineHeight: 1.1 }}>
          Got it. Thank you for sharing.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 16, lineHeight: 1.55, fontFamily: 'var(--serif)' }}>
          A human moderator will review your report within 48 hours. If everything checks out, it&rsquo;ll go live with its own URL — and the next buyer Googling that seller will find it.
        </p>
        <p className="muted small" style={{ marginTop: 12 }}>
          We won&rsquo;t email you (no accounts, remember?). If we have questions, we&rsquo;ll publish anyway with anything we couldn&rsquo;t verify clearly flagged.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <a href="/reports" className="btn btn-primary">Browse other reports</a>
          <a href="/" className="btn btn-ghost">Back to home</a>
        </div>
      </div>
    </section>
  );
}
