"use client";

import { useState } from "react";

import { Icon } from "@/components/Navbar";
import { AdminReport } from "@/lib/reportTypes";
import { formatMoney, relativeDate } from "@/lib/utils";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

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
                border: "2px solid oklch(0.85 0.08 27)",
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
                        style={{ color: "var(--danger)", borderColor: "oklch(0.82 0.09 27)" }}
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
                              borderRadius: 10,
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
                      {report.receipts.map((image, i) => (
                        <a key={image.id} href={image.url} target="_blank" rel="noreferrer" title="Open full size">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.url}
                            alt={`Order receipt ${i + 1}`}
                            loading="lazy"
                            style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line-2)", display: "block" }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

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
                  <button
                    className="btn"
                    type="button"
                    onClick={() => updateReport(report.id, "approved")}
                    style={{
                      background: "var(--ink)",
                      color: "#fff",
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
                    style={{ color: "var(--danger)", borderColor: "oklch(0.82 0.09 27)" }}
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
