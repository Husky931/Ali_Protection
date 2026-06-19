"use client";

import { useState } from "react";

export function ManageResendForm({ invalid }: { invalid: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      await fetch("/api/manage/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      /* generic response regardless */
    }
    setState("sent");
  };

  if (state === "sent") {
    return (
      <p className="muted" style={{ fontSize: 15, lineHeight: 1.55 }}>
        If that email is on file, we just sent your private manage link. Check your inbox — it can take a minute to arrive.
      </p>
    );
  }

  return (
    <form onSubmit={submit}>
      {invalid && (
        <div style={{ marginBottom: 14, padding: 12, background: "var(--bg-2)", borderRadius: 8, fontSize: 13, color: "var(--ink-2)" }}>
          That link is invalid or has expired. Enter your email and we&rsquo;ll send a fresh one.
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          style={{ flex: "1 1 220px" }}
        />
        <button type="submit" className="btn btn-primary" disabled={state === "loading" || !email.trim()}>
          {state === "loading" ? "Sending…" : "Email me my link"}
        </button>
      </div>
    </form>
  );
}
