"use client";

import { useState } from "react";
import type { Report } from "@/lib/reportTypes";
import Link from "next/link";

export function SearchBox({ reports }: { reports: Report[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? reports.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.seller_name.toLowerCase().includes(q) ||
          r.product_name.toLowerCase().includes(q) ||
          r.industry.toLowerCase().includes(q)
        );
      })
    : reports;

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by seller name, product, or industry..."
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-lg text-muted">
            {query.trim()
              ? "No reports match your search."
              : "No reports yet. Be the first to share your story and help protect others."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((report) => (
            <article
              key={report.id}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 transition hover:border-orange-300 hover:shadow-md sm:p-8"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-ink sm:text-2xl">
                      {report.product_name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-orange-600 sm:text-base">
                      {report.seller_name}
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900 sm:text-sm">
                    {report.industry}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                  <span>
                    <span className="font-medium">{report.currency}</span>{" "}
                    {Number(report.total_price).toLocaleString()}
                  </span>
                  <span>·</span>
                  <span>
                    Qty: <span className="font-medium">{report.quantity}</span>
                  </span>
                  <span>·</span>
                  <span className="capitalize">{report.platform}</span>
                </div>
              </div>

              <div className="rounded-lg bg-orange-50 p-4">
                <p className="line-clamp-2 text-base leading-relaxed text-ink">
                  {report.details}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                <Link
                  href={`/reports/${report.slug}`}
                  className="text-sm font-medium text-accent underline transition hover:text-orange-600"
                >
                  Read full report →
                </Link>
                <p className="ml-auto text-xs text-muted">
                  Reported on{" "}
                  {new Date(report.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
