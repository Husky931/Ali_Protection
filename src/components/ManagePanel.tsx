"use client";

import { useState } from "react";
import { Icon } from "./Navbar";
import { INDUSTRIES, CURRENCIES, PLATFORMS } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import type { ReportStatus } from "@/lib/reportTypes";

export type ManageUpdate = {
  id: string;
  body: string;
  status: string;
  created_at: string;
};

export type ManageData = {
  id: string;
  slug: string;
  status: ReportStatus;
  seller_name: string;
  seller_url: string;
  product_name: string;
  product_url: string;
  quantity: string;
  total_price: string;
  currency: string;
  industry: string;
  details: string;
  platform: string;
  updates: ManageUpdate[];
  publicUrl: string | null;
};

const statusLabel: Record<ReportStatus, string> = {
  pending: "Pending review",
  approved: "Published",
  rejected: "Not published",
  retracted: "Taken down",
};

export function ManagePanel({ data }: { data: ManageData }) {
  // Local view so retract/delete update the screen without a reload.
  const [view, setView] = useState<ReportStatus>(data.status);

  if (view === "retracted") {
    return (
      <Notice
        title="Your report has been taken down."
        body="It's no longer public and its photos have been removed. Thanks for letting us know."
      />
    );
  }
  if (view === "rejected") {
    return (
      <Notice
        title="This report wasn't published."
        body="After review it didn't go live. You're welcome to submit a new report with more detail."
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span className="eyebrow">Manage your report</span>
        <span className="chip chip-mono">{statusLabel[view]}</span>
      </div>
      <h1 style={{ fontSize: "clamp(26px, 4vw, 34px)", letterSpacing: "-.03em", lineHeight: 1.1, marginBottom: 8 }}>
        {data.seller_name}
      </h1>

      {view === "pending" ? (
        <PendingEditor data={data} onDeleted={() => setView("rejected")} />
      ) : (
        <ApprovedManager data={data} onRetracted={() => setView("retracted")} />
      )}
    </div>
  );
}

function PendingEditor({
  data,
  onDeleted,
}: {
  data: ManageData;
  onDeleted: () => void;
}) {
  const [form, setForm] = useState({
    seller_name: data.seller_name,
    seller_url: data.seller_url,
    platform: data.platform,
    product_name: data.product_name,
    product_url: data.product_url,
    quantity: data.quantity,
    total_price: data.total_price,
    currency: data.currency,
    industry: data.industry,
    details: data.details,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch(`/api/manage/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          total_price: Number(form.total_price),
        }),
      });
      if (!res.ok) {
        const p = await res.json().catch(() => null);
        throw new Error(p?.error || "Couldn't save your changes.");
      }
      setMsg("Saved. Your report is still pending review.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this report? This can't be undone.")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/manage/${data.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Couldn't delete the report.");
      onDeleted();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <>
      <p className="muted small" style={{ marginBottom: 18, lineHeight: 1.55 }}>
        Your report hasn&rsquo;t been published yet, so you can still edit anything below. Changes go back through review.
      </p>
      <div className="paper" style={{ padding: 24 }}>
        <div className="field">
          <label className="label">Seller name</label>
          <input className="input" value={form.seller_name} onChange={set("seller_name")} />
        </div>
        <div className="field">
          <label className="label">Seller store URL</label>
          <input className="input" value={form.seller_url} onChange={set("seller_url")} />
        </div>
        <div className="field">
          <label className="label">Platform</label>
          <select className="select" value={form.platform} onChange={set("platform")}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label">Product name</label>
          <input className="input" value={form.product_name} onChange={set("product_name")} />
        </div>
        <div className="field">
          <label className="label">Product URL <span className="label-hint">optional</span></label>
          <input className="input" value={form.product_url} onChange={set("product_url")} />
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="label">Quantity</label>
            <input type="number" className="input" value={form.quantity} onChange={set("quantity")} />
          </div>
          <div className="field">
            <label className="label">Industry</label>
            <select className="select" value={form.industry} onChange={set("industry")}>
              <option value="">Select...</option>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="label">Total paid</label>
            <input type="number" className="input" value={form.total_price} onChange={set("total_price")} />
          </div>
          <div className="field">
            <label className="label">Currency</label>
            <select className="select" value={form.currency} onChange={set("currency")}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label className="label">What happened</label>
          <textarea
            className="textarea"
            value={form.details}
            onChange={set("details")}
            style={{ minHeight: 200, fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.6 }}
          />
        </div>

        {msg && <div style={{ marginBottom: 12, fontSize: 13, color: "var(--accent-ink)" }}>{msg}</div>}
        {err && <div style={{ marginBottom: 12, fontSize: 13, color: "var(--danger)" }}>{err}</div>}

        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"} <Icon name="check" size={14} />
          </button>
          <button className="btn btn-ghost" onClick={remove} disabled={busy} style={{ color: "var(--danger)" }}>
            Delete report
          </button>
        </div>
      </div>
    </>
  );
}

function ApprovedManager({
  data,
  onRetracted,
}: {
  data: ManageData;
  onRetracted: () => void;
}) {
  const [updateText, setUpdateText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [submittedUpdate, setSubmittedUpdate] = useState(false);

  const addUpdate = async () => {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch(`/api/manage/${data.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: updateText }),
      });
      if (!res.ok) {
        const p = await res.json().catch(() => null);
        throw new Error(p?.error || "Couldn't add your update.");
      }
      setUpdateText("");
      setSubmittedUpdate(true);
      setMsg("Thanks — your update will appear once a moderator approves it.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const takeDown = async () => {
    if (!confirm("Take this report down? It will be removed from the site along with its photos. This can't be undone.")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/manage/${data.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Couldn't take the report down.");
      onRetracted();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <>
      <p className="muted small" style={{ marginBottom: 18, lineHeight: 1.55 }}>
        Your report is live. Its wording is locked now that it&rsquo;s public, but you can post an update or take it down entirely.
      </p>

      <div className="paper" style={{ padding: 22, marginBottom: 18 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <span className="chip">{data.industry}</span>
          <span className="chip chip-mono">{formatMoney(Number(data.total_price), data.currency)} {data.currency}</span>
          {data.publicUrl && (
            <a className="btn-link small" href={data.publicUrl} target="_blank" rel="noreferrer">
              View public page <Icon name="external" size={12} />
            </a>
          )}
        </div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}>
          {data.details}
        </p>
      </div>

      <div className="paper" style={{ padding: 22, marginBottom: 18 }}>
        <h2 style={{ fontSize: 17, marginBottom: 6 }}>Post an update</h2>
        <p className="muted small" style={{ marginBottom: 12, lineHeight: 1.5 }}>
          Did the seller refund you, ship a replacement, or resolve things? Add an update — it&rsquo;s shown below your report after a quick review.
        </p>
        <textarea
          className="textarea"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          placeholder="Update: the seller refunded me in full on…"
          style={{ minHeight: 120, fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6 }}
        />
        <div className="row" style={{ gap: 10, marginTop: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={addUpdate} disabled={busy || updateText.trim().length < 10}>
            {busy ? "Sending…" : "Submit update"}
          </button>
          {submittedUpdate && <span className="muted small">{msg}</span>}
        </div>
      </div>

      {data.updates.length > 0 && (
        <div className="paper" style={{ padding: 22, marginBottom: 18 }}>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Your updates</h2>
          {data.updates.map((u) => (
            <div key={u.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)" }}>
              <div className="muted small" style={{ marginBottom: 4 }}>
                {u.status === "approved" ? "Live" : u.status === "rejected" ? "Not published" : "Awaiting review"}
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{u.body}</div>
            </div>
          ))}
        </div>
      )}

      {err && <div style={{ marginBottom: 12, fontSize: 13, color: "var(--danger)" }}>{err}</div>}

      <button className="btn btn-ghost" onClick={takeDown} disabled={busy} style={{ color: "var(--danger)", borderColor: "oklch(0.82 0.09 27)" }}>
        Take this report down
      </button>
    </>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", letterSpacing: "-.02em", marginBottom: 12 }}>{title}</h1>
      <p className="muted" style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 460, margin: "0 auto 28px" }}>{body}</p>
      <div className="row" style={{ gap: 12, justifyContent: "center" }}>
        <a href="/reports" className="btn btn-primary">Browse reports</a>
        <a href="/" className="btn btn-ghost">Back to home</a>
      </div>
    </div>
  );
}
