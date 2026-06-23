"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./Navbar";
import { INDUSTRIES, CURRENCIES, PLATFORMS } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import {
  prepareImage,
  prepareReceipt,
  type PreparedImage,
  type PreparedReceipt,
} from "@/lib/clientImage";
import { MAX_IMAGES_PER_REPORT, MAX_RECEIPTS_PER_REPORT } from "@/lib/images";
import { Turnstile, turnstileRequired } from "./Turnstile";
import { TERMS_VERSION } from "@/lib/terms";

// Small inline spinner reusing the global `spin` keyframe (globals.css).
function TileSpinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 18, height: 18, borderRadius: '50%',
        border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite', display: 'inline-block',
      }}
    />
  );
}

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
  const [images, setImages] = useState<PreparedImage[]>([]);
  const [imageError, setImageError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [submitLabel, setSubmitLabel] = useState("");
  // Anti-abuse + consent + post-submit identity handoff.
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [claimSecret, setClaimSecret] = useState<string | null>(null);
  // Optional, private order receipts (kept separate from public evidence photos).
  const [receipts, setReceipts] = useState<PreparedReceipt[]>([]);
  const [receiptError, setReceiptError] = useState("");
  const [receiptBusy, setReceiptBusy] = useState(false);
  // "I don't have an order receipt" path: instead of a receipt the submitter
  // gives a short reason, which the moderator weighs when deciding to publish.
  const [noReceipt, setNoReceipt] = useState(false);
  const [noReceiptReason, setNoReceiptReason] = useState("");

  const handleChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [k]: e.target.value });
  };

  // Mirror state so the unmount cleanup below sees the latest previews.
  const imagesRef = useRef<PreparedImage[]>([]);
  const receiptsRef = useRef<PreparedReceipt[]>([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    receiptsRef.current = receipts;
  }, [receipts]);
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      receiptsRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageError("");
    setImageBusy(true);
    const room = MAX_IMAGES_PER_REPORT - images.length;
    const picked = Array.from(files).slice(0, room);
    const skipped = files.length - picked.length;
    const prepared: PreparedImage[] = [];
    let failedCount = 0;
    let lastFailure = "";
    for (const file of picked) {
      try {
        prepared.push(await prepareImage(file));
      } catch (error) {
        failedCount++;
        lastFailure = error instanceof Error ? error.message : "Couldn't read that image.";
      }
    }
    setImages((prev) => {
      const combined = [...prev, ...prepared];
      combined.slice(MAX_IMAGES_PER_REPORT).forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return combined.slice(0, MAX_IMAGES_PER_REPORT);
    });
    if (failedCount > 0) {
      setImageError(
        failedCount === 1 ? lastFailure : `${failedCount} photos couldn't be added. ${lastFailure}`
      );
    } else if (skipped > 0) {
      setImageError(`Only ${MAX_IMAGES_PER_REPORT} photos per report — ${skipped} skipped.`);
    }
    setImageBusy(false);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
    setImageError("");
  };

  const addReceipts = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setReceiptError("");
    setReceiptBusy(true);
    const room = MAX_RECEIPTS_PER_REPORT - receipts.length;
    const picked = Array.from(files).slice(0, room);
    const prepared: PreparedReceipt[] = [];
    let failedCount = 0;
    let lastFailure = "";
    for (const file of picked) {
      try {
        prepared.push(await prepareReceipt(file));
      } catch (error) {
        failedCount++;
        lastFailure = error instanceof Error ? error.message : "Couldn't read that file.";
      }
    }
    setReceipts((prev) => {
      const combined = [...prev, ...prepared];
      combined.slice(MAX_RECEIPTS_PER_REPORT).forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return combined.slice(0, MAX_RECEIPTS_PER_REPORT);
    });
    if (failedCount > 0) {
      setReceiptError(
        failedCount === 1 ? lastFailure : `${failedCount} files couldn't be added. ${lastFailure}`,
      );
    }
    setReceiptBusy(false);
  };

  const removeReceipt = (id: string) => {
    setReceipts((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
    setReceiptError("");
  };

  // A receipt and the "no receipt" reason are mutually exclusive: ticking the
  // box drops any attached receipts; unticking clears the reason text.
  const toggleNoReceipt = (checked: boolean) => {
    setNoReceipt(checked);
    if (checked) {
      setReceipts((prev) => {
        prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        return [];
      });
      setReceiptError("");
    } else {
      setNoReceiptReason("");
    }
  };

  const steps = [
    { label: 'Seller' },
    { label: 'Order' },
    { label: 'Story' },
    { label: 'Review' },
  ];

  const stepValid = [
    form.seller_name.trim() && form.seller_url.trim(),
    form.product_name.trim() && form.quantity && form.total_price && form.industry,
    // Photos are optional. The receipt is optional too, but the submitter must
    // either attach one or tick "no receipt" and say why (so the moderator
    // always has a basis to judge an unverified report).
    form.details.trim().length > 60 &&
      (receipts.length > 0 || (noReceipt && noReceiptReason.trim().length >= 3)),
    true,
  ];

  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMessage("");

    // Photos go straight from the browser to R2 via presigned PUT URLs —
    // image bytes never pass through our own API routes.
    let imageKeys: string[] = [];
    if (images.length > 0) {
      setSubmitLabel("Uploading photos…");
      try {
        const presignResponse = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: images.map((image) => ({
              content_type: image.contentType,
              size_bytes: image.blob.size,
            })),
          }),
        });
        if (!presignResponse.ok) {
          const payload = await presignResponse.json().catch(() => null);
          throw new Error(
            presignResponse.status === 503
              ? "Photo uploads are temporarily unavailable. Remove the photos to submit without them, or try again later."
              : payload?.error || "Could not upload photos."
          );
        }
        const { uploads } = (await presignResponse.json()) as {
          uploads: { key: string; url: string }[];
        };
        await Promise.all(
          uploads.map((upload, i) =>
            fetch(upload.url, {
              method: "PUT",
              headers: { "Content-Type": images[i].contentType },
              body: images[i].blob,
            }).then((r) => {
              if (!r.ok) throw new Error("Could not upload photos. Please try again.");
            })
          )
        );
        imageKeys = uploads.map((upload) => upload.key);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Could not upload photos.");
        setSubmitLabel("");
        return;
      }
    }

    // Private order receipts upload to the receipts/ prefix (kind: "receipt").
    let receiptKeys: string[] = [];
    if (receipts.length > 0) {
      setSubmitLabel("Uploading receipt…");
      try {
        const presignResponse = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "receipt",
            files: receipts.map((image) => ({
              content_type: image.contentType,
              size_bytes: image.blob.size,
            })),
          }),
        });
        if (!presignResponse.ok) {
          const payload = await presignResponse.json().catch(() => null);
          throw new Error(payload?.error || "Could not upload the receipt.");
        }
        const { uploads } = (await presignResponse.json()) as {
          uploads: { key: string; url: string }[];
        };
        await Promise.all(
          uploads.map((upload, i) =>
            fetch(upload.url, {
              method: "PUT",
              headers: { "Content-Type": receipts[i].contentType },
              body: receipts[i].blob,
            }).then((r) => {
              if (!r.ok) throw new Error("Could not upload the receipt. Please try again.");
            }),
          ),
        );
        receiptKeys = uploads.map((upload) => upload.key);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Could not upload the receipt.");
        setSubmitLabel("");
        return;
      }
    }

    setSubmitLabel("Submitting…");
    let response: Response;
    try {
      response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          total_price: Number(form.total_price),
          images: imageKeys,
          receipts: receiptKeys,
          no_receipt_reason: noReceipt ? noReceiptReason.trim() : "",
          website: honeypot,
          turnstileToken,
          terms_version: TERMS_VERSION,
        }),
      });
    } catch {
      setStatus("error");
      setErrorMessage("Network error — your report wasn't submitted. Please try again.");
      setSubmitLabel("");
      return;
    }
    setSubmitLabel("");

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus("error");
      setErrorMessage(payload?.error || "Could not submit report.");
      return;
    }

    // report_id + claim_secret let the success screen optionally attach an email.
    const result = await response.json().catch(() => null);
    setReportId(result?.report_id ?? null);
    setClaimSecret(result?.claim_secret ?? null);

    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    setStatus("success");
    setStep(4);
  };

  if (step === 4)
    return <Submitted reportId={reportId} claimSecret={claimSecret} />;

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
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 6,
      }}>
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          const locked = i > step || status === "loading";
          return (
            <div key={i} style={{ flex: 1, position: 'relative' }}>
              <button
                disabled={locked}
                onClick={() => !locked && setStep(i)}
                style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 2, padding: '10px 14px',
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--bg)' : (done ? 'var(--ink)' : 'var(--muted)'),
                  border: 'none', borderRadius: 8,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}>
                {done && (
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.06em',
                    color: 'var(--accent-ink)',
                  }}>
                    ✓ DONE
                  </span>
                )}
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="paper" style={{ padding: 32 }}>
        {step === 0 && <StepSeller form={form} handleChange={handleChange} />}
        {step === 1 && <StepOrder form={form} handleChange={handleChange} />}
        {step === 2 && (
          <StepStory
            form={form}
            handleChange={handleChange}
            images={images}
            imageError={imageError}
            imageBusy={imageBusy}
            onAddFiles={addFiles}
            onRemoveImage={removeImage}
            receipts={receipts}
            receiptError={receiptError}
            receiptBusy={receiptBusy}
            onAddReceipts={addReceipts}
            onRemoveReceipt={removeReceipt}
            noReceipt={noReceipt}
            noReceiptReason={noReceiptReason}
            onToggleNoReceipt={toggleNoReceipt}
            onChangeReason={(e: React.ChangeEvent<HTMLInputElement>) => setNoReceiptReason(e.target.value)}
          />
        )}
        {step === 3 && (
          <>
            <StepReview form={form} images={images} receipts={receipts} noReceipt={noReceipt} noReceiptReason={noReceiptReason} jump={setStep} />

            {/* Honeypot — pushed off-screen and hidden from assistive tech. Bots
                that auto-fill inputs populate it; humans never see it, and a
                non-empty value is silently dropped server-side. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 22, fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0 }}
              />
              <span className="muted">
                I confirm this report is truthful and based on my own genuine experience, I have the right to share any evidence I&rsquo;ve attached, and I agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="btn-link">Terms</a>.
              </span>
            </label>

            <Turnstile onToken={setTurnstileToken} />

            {errorMessage && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-2)', color: 'var(--danger)', borderRadius: 8, fontSize: 13 }}>
                {errorMessage}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button className="btn btn-ghost" disabled={step === 0 || status === "loading"} onClick={() => setStep(step - 1)}
          style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
          <Icon name="arrow-left" size={14} /> Back
        </button>
        {step < 3 ? (
          <button className="btn btn-primary"
            disabled={!stepValid[step] || (step === 2 && (imageBusy || receiptBusy))}
            onClick={() => setStep(step + 1)}
            style={{ opacity: stepValid[step] && !(step === 2 && (imageBusy || receiptBusy)) ? 1 : 0.4 }}>
            {step === 2 && (imageBusy || receiptBusy) ? 'Processing photos…' : 'Continue'} <Icon name="arrow-right" size={14} />
          </button>
        ) : (
          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={
              status === "loading" ||
              imageBusy ||
              !termsAccepted ||
              (turnstileRequired && !turnstileToken)
            }
            style={{
              opacity:
                termsAccepted && !(turnstileRequired && !turnstileToken) ? 1 : 0.4,
            }}
          >
            {status === "loading" ? (submitLabel || "Submitting…") : "Submit report"} <Icon name="check" size={14} />
          </button>
        )}
      </div>
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

function StepStory({ form, handleChange, images, imageError, imageBusy, onAddFiles, onRemoveImage, receipts, receiptError, receiptBusy, onAddReceipts, onRemoveReceipt, noReceipt, noReceiptReason, onToggleNoReceipt, onChangeReason }: any) {
  const len = form.details.length;
  const room = MAX_IMAGES_PER_REPORT - images.length;
  return (
    <div>
      <h2 style={{ fontSize: 22, letterSpacing: '-.02em', marginBottom: 6 }}>What happened?</h2>
      <p className="muted small" style={{ marginBottom: 22 }}>Describe your experience with this seller.</p>
      <div className="field">
        <textarea className="textarea" value={form.details} onChange={handleChange('details')}
          style={{ minHeight: 260, fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.6 }}
          placeholder={"I wired the deposit on March 12. The seller had a Gold rating and a three-year history...\n\nA week later, I got a tracking number that worked for one day, then went dead..."} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="muted small">Min 60 characters · {len < 60 ? `${60 - len} to go` : 'looks good'}</span>
          <span className="muted small">{len} characters</span>
        </div>
      </div>

      <div className="field">
        <label className="label">
          Photos <span className="label-hint">optional, up to {MAX_IMAGES_PER_REPORT} — photos of the products you received</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {images.map((image: PreparedImage, i: number) => (
            <div key={image.id} style={{ position: 'relative', width: 96, height: 96 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={`Photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line-2)', display: 'block' }} />
              <button type="button" onClick={() => onRemoveImage(image.id)} aria-label={`Remove photo ${i + 1}`}
                style={{
                  position: 'absolute', top: -8, right: -8, width: 24, height: 24,
                  borderRadius: 999, background: 'var(--ink)', color: 'var(--bg)', border: '2px solid var(--card)',
                  display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0,
                }}>
                ×
              </button>
              <span style={{
                position: 'absolute', bottom: 4, left: 4, padding: '1px 6px', borderRadius: 6,
                background: 'rgba(0,0,0,.55)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10,
              }}>
                {Math.max(1, Math.round(image.blob.size / 1024))} KB
              </span>
            </div>
          ))}
          {room > 0 && (
            <label style={{
              width: 96, height: 96, borderRadius: 8, border: '1px dashed var(--line-2)',
              background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, cursor: imageBusy ? 'wait' : 'pointer',
              color: 'var(--muted)', fontSize: 11, textAlign: 'center',
            }}>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={imageBusy}
                style={{ display: 'none' }}
                onChange={(e) => {
                  onAddFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              {imageBusy ? <TileSpinner /> : <Icon name="camera" size={16} />}
              {imageBusy ? 'Processing…' : 'Add photos'}
            </label>
          )}
        </div>
        {imageError && (
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--danger)' }}>{imageError}</div>
        )}
      </div>

      <div className="field">
        <label className="label">
          Order receipt <span className="label-hint">optional &amp; private — a screenshot or PDF of your platform order/receipt. Never shown publicly; only a moderator sees it to confirm you really purchased. Earns a &ldquo;Purchase verified&rdquo; badge.</span>
        </label>
        {!noReceipt && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {receipts.map((image: PreparedReceipt, i: number) => (
                <div key={image.id} style={{ position: 'relative', width: 96, height: 96 }}>
                  {image.isPdf ? (
                    <div title={image.fileName}
                      style={{ width: '100%', height: '100%', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--ink-2)', padding: 6, textAlign: 'center' }}>
                      <Icon name="file-text" size={22} />
                      <span style={{ fontSize: 10, fontWeight: 600 }}>PDF</span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={image.previewUrl} alt={`Receipt ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line-2)', display: 'block' }} />
                  )}
                  <button type="button" onClick={() => onRemoveReceipt(image.id)} aria-label={`Remove receipt ${i + 1}`}
                    style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 999, background: 'var(--ink)', color: 'var(--bg)', border: '2px solid var(--card)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </div>
              ))}
              {receipts.length < MAX_RECEIPTS_PER_REPORT && (
                <label style={{ width: 96, height: 96, borderRadius: 8, border: '1px dashed var(--line-2)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: receiptBusy ? 'wait' : 'pointer', color: 'var(--muted)', fontSize: 11, textAlign: 'center' }}>
                  <input type="file" accept="image/*,application/pdf" multiple disabled={receiptBusy} style={{ display: 'none' }}
                    onChange={(e) => { onAddReceipts(e.target.files); e.target.value = ''; }} />
                  {receiptBusy ? <TileSpinner /> : <Icon name="lock" size={16} />}
                  {receiptBusy ? 'Processing…' : 'Add receipt'}
                </label>
              )}
            </div>
            {receiptError && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--danger)' }}>{receiptError}</div>
            )}
          </>
        )}

        {/* No-receipt path: a short reason the moderator weighs instead. */}
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, fontSize: 14, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={noReceipt}
            onChange={(e) => onToggleNoReceipt(e.target.checked)}
            style={{ width: 16, height: 16, flexShrink: 0 }}
          />
          <span className="muted">I don&rsquo;t have an order receipt</span>
        </label>

        {noReceipt && (
          <div style={{ marginTop: 12 }}>
            <label className="label">
              Why not? <span className="label-hint">a few words — the moderator reads this to decide whether to publish</span>
            </label>
            <input
              className="input"
              value={noReceiptReason}
              onChange={onChangeReason}
              maxLength={200}
              placeholder="e.g. paid by bank transfer, lost the invoice, deal was off-platform"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span className="muted small">{noReceiptReason.trim().length < 3 ? 'Add a short reason' : 'looks good'}</span>
              <span className="muted small">{noReceiptReason.length}/200</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--bg-2)', border: '1px dashed var(--line-2)', borderRadius: 8, padding: 14, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
        <strong style={{ color: 'var(--ink-2)' }}>Tips:</strong> Include the timeline, the dispute outcome, and any responses from the seller. Don&rsquo;t include anything you don&rsquo;t want public in the photos or blur out certain parts.
      </div>
    </div>
  );
}

function StepReview({ form, images, receipts, noReceipt, noReceiptReason, jump }: any) {
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
      <p className="muted small" style={{ marginBottom: 22 }}>Once you submit, a moderator will review within 48 hours.</p>
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
        <div style={{ padding: '12px 0', borderBottom: '1px dashed var(--line)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: 4 }}>Photos</div>
            {images.length === 0 ? (
              <div className="muted" style={{ fontSize: 14.5 }}>None attached</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {images.map((image: PreparedImage, i: number) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={image.id} src={image.previewUrl} alt={`Photo ${i + 1}`}
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line-2)' }} />
                ))}
              </div>
            )}
          </div>
          <button className="btn-link small" onClick={() => jump(2)}>Edit</button>
        </div>
        <Field
          label="Order receipt"
          value={
            receipts.length > 0
              ? `${receipts.length} file${receipts.length > 1 ? 's' : ''} attached (private)`
              : noReceipt
                ? `Not provided — “${noReceiptReason.trim()}”`
                : 'Not provided'
          }
          onEdit={() => jump(2)}
        />
      </div>
    </div>
  );
}

function Submitted({
  reportId,
  claimSecret,
}: {
  reportId: string | null;
  claimSecret: string | null;
}) {
  // Only offer email capture when we have the one-time handoff from submit.
  const canClaim = Boolean(reportId && claimSecret);
  const [email, setEmail] = useState("");
  const [claimState, setClaimState] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [claimError, setClaimError] = useState("");

  const attachEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canClaim || claimState === "loading") return;
    const trimmed = email.trim();
    if (!trimmed) return;
    setClaimState("loading");
    setClaimError("");
    try {
      const res = await fetch("/api/manage/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          claim_secret: claimSecret,
          email: trimmed,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(
          payload?.error || "Couldn't send the link. Please try again.",
        );
      }
      setClaimState("sent");
    } catch (err) {
      setClaimState("error");
      setClaimError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section style={{ paddingTop: 64, paddingBottom: 100, textAlign: 'center' }}>
      <div className="container-narrow">
        <div style={{
          width: 72, height: 72, borderRadius: 999, margin: '0 auto 24px',
          background: 'var(--accent-soft)', color: 'var(--accent-ink)',
          display: 'grid', placeItems: 'center',
          border: '2px solid oklch(0.45 0.12 27)',
        }}>
          <Icon name="check" size={32} />
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-.03em', lineHeight: 1.1 }}>
          Got it. Thank you for sharing.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 16, lineHeight: 1.55, fontFamily: 'var(--serif)' }}>
          A human moderator will review your report within 48 hours. If approved, it&rsquo;ll will appear live on the website so the other buyers might avoid that seller.
        </p>

        {canClaim && claimState !== "sent" && (
          <div className="paper" style={{ padding: 24, marginTop: 32, textAlign: 'left' }}>
            <h2 style={{ fontSize: 18, letterSpacing: '-.01em', marginBottom: 8 }}>
              Want to update or delete this report later?
            </h2>
            <p className="muted small" style={{ lineHeight: 1.55, marginBottom: 16 }}>
              Things change — the seller might refund you, ship a replacement, or settle. Add your email and we&rsquo;ll send a private link to manage this report. No password, no account to remember. Skip it and your report still goes live; you just won&rsquo;t be able to edit it afterward.
            </p>
            <form onSubmit={attachEmail} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={claimState === "loading"}
                style={{ flex: '1 1 220px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={claimState === "loading" || !email.trim()}
              >
                {claimState === "loading" ? "Sending…" : "Email me the link"}
              </button>
            </form>
            {claimState === "error" && (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--danger)' }}>{claimError}</div>
            )}
            <p className="muted" style={{ fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>
              We only use your email to send this manage link and to tell you once your report is reviewed. It&rsquo;s never shown publicly.
            </p>
          </div>
        )}

        {claimState === "sent" && (
          <div className="paper" style={{ padding: 24, marginTop: 32, textAlign: 'left' }}>
            <h2 style={{ fontSize: 18, letterSpacing: '-.01em', marginBottom: 8 }}>Check your inbox</h2>
            <p className="muted small" style={{ lineHeight: 1.55 }}>
              If that address is valid, we just sent a private link to manage this report. Click it to confirm — then you can update or delete your report any time.
            </p>
          </div>
        )}

        {!canClaim && (
          <p className="muted small" style={{ marginTop: 12 }}>
            If we have questions, we&rsquo;ll publish anyway with anything we couldn&rsquo;t verify clearly flagged.
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <a href="/reports" className="btn btn-primary">Browse other reports</a>
        </div>
      </div>
    </section>
  );
}
