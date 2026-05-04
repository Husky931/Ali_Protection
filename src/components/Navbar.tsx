"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-bold text-ink">
          Alibaba Scam Reports
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/report"
            className="rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            Report a Seller
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="sm:hidden text-ink"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border px-6 pb-4 sm:hidden">
          <Link
            href="/report"
            className="mt-2 block rounded-lg bg-ink px-5 py-2 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Report a Seller
          </Link>
        </div>
      )}
    </nav>
  );
}
