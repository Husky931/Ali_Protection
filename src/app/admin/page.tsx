"use client";

import { useState, type ChangeEvent, type CSSProperties } from "react";

import { Icon } from "@/components/Navbar";
import { AdminReport } from "@/lib/reportTypes";
import { formatMoney, relativeDate } from "@/lib/utils";
// === TEMP-SEED-EDIT: imports for the in-admin report editor (remove with feature) ===
import { INDUSTRIES, CURRENCIES, PLATFORMS } from "@/lib/constants";
import { MAX_IMAGES_PER_REPORT } from "@/lib/images";
import { prepareImage, type PreparedImage } from "@/lib/clientImage";
// === END TEMP-SEED-EDIT ===

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // TEMP-SEED-EDIT

  const fetchReports = async () => {
    if (!password) return;
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/admin/reports", {
      headers: {
        "x-admin-password": password,
      },
    });

    if (!response.ok) {
      setStatus("error");
      setMessage("Unauthorized or failed to load reports.");
      return;
    }

    const payload = await response.json();
    setReports(payload.data || []);
    setLoaded(true);
    setStatus("idle");
  };

  const updateReport = async (
    id: string,
    nextStatus: "approved" | "rejected"
  ) => {
    const response = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      setStatus("error");
      setMessage("Failed to update report.");
      return;
    }

    setReports((prev) => prev.filter((report) => report.id !== id));
  };

  const setPurchaseVerified = async (id: string, value: boolean) => {
    const response = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ purchase_verified: value }),
    });
    if (!response.ok) {
      setStatus("error");
      setMessage("Failed to update purchase status.");
      return;
    }
    setReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, purchase_verified: value } : report,
      ),
    );
  };

  const clear = () => {
    setPassword("");
    setReports([]);
    setMessage("");
    setStatus("idle");
    setLoaded(false);
  };

  return (
    <div className="page container-narrow" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow">Moderation</span>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", letterSpacing: "-.03em", marginTop: 10, lineHeight: 1.1 }}>
          Admin review
        </h1>
        <p className="muted" style={{ fontSize: 16, marginTop: 10, lineHeight: 1.5 }}>
          Enter the admin password to review pending reports before they go public.
        </p>
      </div>

      {/* Password gate */}
      <form
        className="paper"
        style={{ padding: 24, marginBottom: 32 }}
        onSubmit={(e) => {
          e.preventDefault();
          fetchReports();
        }}
      >
        <div className="field" style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="admin-password">
            <Icon name="lock" size={12} /> Admin password
          </label>
          <input
            id="admin-password"
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoFocus
          />
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!password || status === "loading"}
            style={{ opacity: !password || status === "loading" ? 0.4 : 1 }}
          >
            {status === "loading" ? "Unlocking…" : "Unlock"}
            <Icon name="arrow-right" size={14} />
          </button>
          <button className="btn btn-ghost" type="button" onClick={clear}>
            Clear
          </button>
        </div>
        {message ? (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "var(--bg-2)",
              color: "var(--danger)",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        ) : null}
      </form>

      {/* Pending reports */}
      {loaded ? (
        reports.length === 0 ? (
          <div className="paper" style={{ padding: 32, textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                margin: "0 auto 16px",
                background: "var(--accent-soft)",
                color: "var(--accent-ink)",
                display: "grid",
                placeItems: "center",
                border: "2px solid oklch(0.45 0.12 27)",
              }}
            >
              <Icon name="check" size={26} />
            </div>
            <h2 style={{ fontSize: 20, letterSpacing: "-.02em" }}>All caught up</h2>
            <p className="muted small" style={{ marginTop: 6 }}>
              No pending reports waiting for review.
            </p>
          </div>
        ) : (
          <div className="stack">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, letterSpacing: "-.02em" }}>Pending reports</h2>
              <span className="chip chip-orange">
                {reports.length} awaiting review
              </span>
            </div>
            {reports.map((report) => (
              <article key={report.id} className="paper" style={{ padding: 24 }}>
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 19, letterSpacing: "-.02em" }}>{report.product_name}</h3>
                    <p className="muted small" style={{ marginTop: 4 }}>{report.seller_name}</p>
                  </div>
                  <span className="muted small" style={{ whiteSpace: "nowrap", fontFamily: "var(--mono)" }}>
                    {relativeDate(report.created_at)}
                  </span>
                </div>

                <div className="row" style={{ flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  <span className="chip">{report.platform}</span>
                  {report.industry ? <span className="chip">{report.industry}</span> : null}
                  <span className="chip chip-mono">
                    {formatMoney(report.total_price, report.currency)} {report.currency}
                  </span>
                  <span className="chip chip-mono">Qty {Number(report.quantity).toLocaleString()}</span>
                </div>

                {(report.has_email || report.possible_duplicates.length > 0) ? (
                  <div className="row" style={{ flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {report.has_email ? (
                      <span className="chip" style={{ background: "var(--bg-2)" }}>
                        <Icon name="check" size={11} /> Email {report.email_verified ? "verified" : "added"}
                      </span>
                    ) : null}
                    {report.possible_duplicates.length > 0 ? (
                      <span
                        className="chip"
                        style={{ color: "var(--danger)", borderColor: "oklch(0.55 0.15 27)" }}
                        title={report.possible_duplicates.map((d) => `${d.seller_name} (${d.status})`).join(", ")}
                      >
                        ⚠ {report.possible_duplicates.length} possible duplicate
                        {report.possible_duplicates.length > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                    marginTop: 16,
                    whiteSpace: "pre-wrap",
                    maxHeight: 220,
                    overflow: "auto",
                  }}
                >
                  {report.details}
                </p>

                {report.images?.length > 0 ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="camera" size={12} /> Evidence photos ({report.images.length})
                    </div>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      {report.images.map((image, i) => (
                        <a key={image.id} href={image.url} target="_blank" rel="noreferrer" title="Open full size">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.url}
                            alt={`Evidence photo ${i + 1}`}
                            loading="lazy"
                            style={{
                              width: 110,
                              height: 110,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid var(--line-2)",
                              display: "block",
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {report.receipts?.length > 0 ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="lock" size={12} /> Order receipt — private, never published ({report.receipts.length})
                    </div>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      {report.receipts.map((image, i) =>
                        image.contentType === "application/pdf" ? (
                          <a
                            key={image.id}
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open PDF receipt"
                            style={{ width: 110, height: 110, borderRadius: 8, border: "1px solid var(--line-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "var(--bg-2)", color: "var(--ink-2)", textDecoration: "none", fontSize: 11, fontWeight: 600 }}
                          >
                            <Icon name="file-text" size={26} />
                            PDF receipt
                          </a>
                        ) : (
                          <a key={image.id} href={image.url} target="_blank" rel="noreferrer" title="Open full size">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url}
                              alt={`Order receipt ${i + 1}`}
                              loading="lazy"
                              style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line-2)", display: "block" }}
                            />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                ) : report.receipt_count > 0 ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="lock" size={12} /> Order receipt — on file, preview unavailable ({report.receipt_count})
                    </div>
                    <div className="muted small">
                      A receipt was attached but couldn&rsquo;t be loaded (image storage unavailable). Don&rsquo;t treat this as &ldquo;no receipt&rdquo; — retry later before deciding.
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="lock" size={12} /> Order receipt — none attached
                    </div>
                    {report.no_receipt_reason ? (
                      <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)", background: "var(--bg-2)", border: "1px dashed oklch(0.55 0.15 27)", borderRadius: 8, padding: "10px 12px" }}>
                        <span style={{ color: "var(--danger)", fontWeight: 600 }}>No receipt — submitter&rsquo;s reason:</span>{" "}
                        &ldquo;{report.no_receipt_reason}&rdquo;
                      </div>
                    ) : (
                      <div className="muted small">No order receipt was provided.</div>
                    )}
                  </div>
                )}

                <div className="row" style={{ gap: 18, marginTop: 16, flexWrap: "wrap" }}>
                  {report.seller_url ? (
                    <a className="btn-link small" href={report.seller_url} target="_blank" rel="noreferrer">
                      Seller link <Icon name="external" size={12} />
                    </a>
                  ) : null}
                  {report.product_url ? (
                    <a className="btn-link small" href={report.product_url} target="_blank" rel="noreferrer">
                      Product link <Icon name="external" size={12} />
                    </a>
                  ) : null}
                </div>

                {/* === TEMP-SEED-EDIT: inline editor for this pending report === */}
                {editingId === report.id ? (
                  <ReportEditor
                    report={report}
                    password={password}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      fetchReports();
                    }}
                  />
                ) : null}
                {/* === END TEMP-SEED-EDIT === */}

                <div className="divider" style={{ margin: "20px 0 18px" }} />

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={report.purchase_verified}
                    onChange={(e) => setPurchaseVerified(report.id, e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  Purchase verified{" "}
                  <span className="muted small">(shows a &ldquo;Purchase verified&rdquo; badge on the public report)</span>
                </label>

                <div className="row" style={{ gap: 10 }}>
                  {/* TEMP-SEED-EDIT */}
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() =>
                      setEditingId(editingId === report.id ? null : report.id)
                    }
                  >
                    {editingId === report.id ? "Close editor" : "✎ Edit"}
                  </button>
                  {/* END TEMP-SEED-EDIT */}
                  <button
                    className="btn"
                    type="button"
                    onClick={() => updateReport(report.id, "approved")}
                    style={{
                      background: "var(--ink)",
                      color: "var(--bg)",
                      borderColor: "var(--ink)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <Icon name="check" size={14} /> Approve & publish
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => updateReport(report.id, "rejected")}
                    style={{ color: "var(--danger)", borderColor: "oklch(0.55 0.15 27)" }}
                  >
                    <Icon name="x" size={14} /> Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

// === TEMP-SEED-EDIT: temporary in-admin editor for seeded reports ===
// Lets a moderator fix any field and add/remove evidence photos on a PENDING
// report before approving it. Remove this whole block (and the tagged bits in
// AdminPage + the PATCH route) once seeding is done.
function ReportEditor({
  report,
  password,
  onSaved,
  onCancel,
}: {
  report: AdminReport;
  password: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    seller_name: report.seller_name || "",
    seller_url: report.seller_url || "",
    platform: report.platform || "Alibaba.com",
    product_name: report.product_name || "",
    product_url: report.product_url || "",
    quantity: String(report.quantity ?? ""),
    total_price: String(report.total_price ?? ""),
    currency: report.currency || "USD",
    industry: report.industry || "",
    details: report.details || "",
  });
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<PreparedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set =
    (k: keyof typeof f) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF((prev) => ({ ...prev, [k]: e.target.value }));

  const keptExisting = report.images.filter((im) => !removeIds.includes(im.id));
  const room = MAX_IMAGES_PER_REPORT - keptExisting.length - newImages.length;

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    const prepared: PreparedImage[] = [];
    for (const file of picked) {
      try {
        prepared.push(await prepareImage(file));
      } catch {
        /* skip unreadable file */
      }
    }
    setNewImages((p) => [...p, ...prepared].slice(0, MAX_IMAGES_PER_REPORT));
  };

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      let addKeys: string[] = [];
      if (newImages.length > 0) {
        const pres = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: newImages.map((im) => ({
              content_type: im.contentType,
              size_bytes: im.blob.size,
            })),
          }),
        });
        if (!pres.ok) {
          throw new Error(
            (await pres.json().catch(() => null))?.error || "Photo upload failed.",
          );
        }
        const { uploads } = (await pres.json()) as {
          uploads: { key: string; url: string }[];
        };
        await Promise.all(
          uploads.map((u, i) =>
            fetch(u.url, {
              method: "PUT",
              headers: { "Content-Type": newImages[i].contentType },
              body: newImages[i].blob,
            }).then((r) => {
              if (!r.ok) throw new Error("Photo upload failed.");
            }),
          ),
        );
        addKeys = uploads.map((u) => u.key);
      }

      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          edit: {
            fields: {
              ...f,
              quantity: Number(f.quantity),
              total_price: Number(f.total_price),
            },
            add_images: addKeys,
            remove_image_ids: removeIds,
          },
        }),
      });
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.error || "Save failed.",
        );
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  };

  const removeBtnStyle: CSSProperties = {
    position: "absolute",
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 999,
    background: "var(--ink)",
    color: "var(--bg)",
    border: "2px solid var(--card)",
    cursor: "pointer",
    fontSize: 12,
    lineHeight: 1,
    padding: 0,
  };

  return (
    <div className="paper" style={{ padding: 18, marginTop: 16, background: "var(--bg-2)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
        ✎ Edit before approving
      </div>

      <div className="field">
        <label className="label">Seller name</label>
        <input className="input" value={f.seller_name} onChange={set("seller_name")} />
      </div>
      <div className="field">
        <label className="label">Seller URL</label>
        <input className="input" value={f.seller_url} onChange={set("seller_url")} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label className="label">Platform</label>
          <select className="select" value={f.platform} onChange={set("platform")}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label">Industry</label>
          <select className="select" value={f.industry} onChange={set("industry")}>
            <option value="">Select...</option>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label">Product name</label>
        <input className="input" value={f.product_name} onChange={set("product_name")} />
      </div>
      <div className="field">
        <label className="label">Product URL</label>
        <input className="input" value={f.product_url} onChange={set("product_url")} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label className="label">Quantity</label>
          <input type="number" className="input" value={f.quantity} onChange={set("quantity")} />
        </div>
        <div className="field">
          <label className="label">Total paid</label>
          <input type="number" className="input" value={f.total_price} onChange={set("total_price")} />
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label className="label">Currency</label>
          <select className="select" value={f.currency} onChange={set("currency")}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label">Story / details</label>
        <textarea className="textarea" style={{ minHeight: 160 }} value={f.details} onChange={set("details")} />
      </div>

      <div className="field">
        <label className="label">
          Evidence photos ({keptExisting.length + newImages.length}/{MAX_IMAGES_PER_REPORT})
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {keptExisting.map((im, i) => (
            <div key={im.id} style={{ position: "relative", width: 90, height: 90 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid var(--line-2)", display: "block" }} />
              <button type="button" aria-label="Remove photo" onClick={() => setRemoveIds((p) => [...p, im.id])} style={removeBtnStyle}>×</button>
            </div>
          ))}
          {newImages.map((im, i) => (
            <div key={im.id} style={{ position: "relative", width: 90, height: 90 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.previewUrl} alt={`New photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "2px solid var(--accent)", display: "block" }} />
              <button type="button" aria-label="Remove new photo" onClick={() => setNewImages((p) => p.filter((x) => x.id !== im.id))} style={removeBtnStyle}>×</button>
            </div>
          ))}
          {room > 0 ? (
            <label style={{ width: 90, height: 90, borderRadius: 8, border: "1px dashed var(--line-2)", background: "var(--card)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", color: "var(--muted)", fontSize: 11 }}>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <Icon name="camera" size={16} /> Add
            </label>
          ) : null}
        </div>
      </div>

      {err ? (
        <div style={{ marginTop: 4, marginBottom: 10, color: "var(--danger)", fontSize: 13 }}>{err}</div>
      ) : null}

      <div className="row" style={{ gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" type="button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
// === END TEMP-SEED-EDIT ===
