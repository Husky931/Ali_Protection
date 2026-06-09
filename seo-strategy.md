# SEO Strategy — AlibabaScammer.com

> Living document. SEO is the project's primary growth channel (see `project_guidelines.md`).
> Every page and content decision is judged by: **does this help us rank for what buyers search?**

**Domain:** `alibabascammer.com` — exact-match for our primary keyword (a real ranking asset).
**Brand:** Alibaba Scammer.

---

## 1. North star

When a buyer Googles a seller's name (or "alibaba scam") before wiring money, **our page should be on page one.** The site is engineered for this: one indexable, uniquely-described page per approved report. Growth is the compounding sum of many low-competition pages, not one viral page.

---

## 2. Keyword strategy — 3 tiers

We win the easy ground first to build domain authority, then reach for the high-volume terms.

### Tier 1 — Long-tail, per-report (WIN FIRST — the engine)
- **Queries:** `"[seller name] scam"`, `"[seller name] alibaba review"`, `"[seller name] legit"`, `"is [seller] a scammer"`.
- **Volume/comp:** tiny per query, **near-zero competition**, highest buyer intent.
- **Why first:** a brand-new site with no authority can rank here within weeks, and it compounds across every report. This is the programmatic-SEO play and it's exactly what the per-report `generateMetadata` (now shipped) unblocks.
- **Owned by:** `/reports/[slug]` — title `"{seller} — Alibaba Scam Report & Buyer Review"`, unique description, canonical, `Article` + `BreadcrumbList` JSON-LD.

### Tier 2 — Primary head term (brand + category)
- **Queries:** `"alibaba scammer"`, `"alibaba scam"`, `"alibaba scams"`, `"report alibaba scammer"`, `"alibaba scammer list"`.
- **Volume/comp:** ~1K–10K/mo, **low competition.**
- **Why:** exact-match domain gives a relevance edge; low competition makes top-10 realistic within months. This is our brand term — we should own it.
- **Owned by:** `/` (homepage) and `/reports` (browse / "scammer list").

### Tier 3 — Secondary, high-volume (STRETCH — later)
- **Queries:** `"alibaba reviews"`, `"is alibaba safe"`, `"is alibaba legit"`, `"alibaba trade assurance not working"`.
- **Volume/comp:** ~10K–100K/mo, **medium competition**, broader/mixed intent (many want reviews *of Alibaba the platform*, not scam reports).
- **Why not head-on yet:** a young site won't outrank established players for a medium-comp 5-figure term, and the intent only partially matches. **Capture its long-tail and informational slices via guide/pillar pages** (Workstream D) *after* Tiers 1–2 build authority.
- **Owned by:** `/guides/*` (future).

**Sequencing rationale:** low-comp wins → authority + internal links → push higher-volume terms. Matches the "simplicity first, defer until traffic" guideline.

---

## 3. Page → keyword map

| Page | Primary targets | Indexed? |
|------|-----------------|----------|
| `/` (home) | alibaba scammer, alibaba scam, report alibaba scammer | ✅ |
| `/reports` | alibaba scammer list, list of alibaba scammers, alibaba scam reports | ✅ (params → `noindex,follow` + canonical to `/reports`) |
| `/reports/[slug]` | "[seller] scam", "[seller] alibaba review", "[seller] legit" | ✅ **(the engine)** |
| `/submit-report` | — (conversion page) | ❌ `noindex,follow` |
| `/admin` | — | ❌ `noindex,nofollow` + robots disallow |
| `/guides/*` (future) | is alibaba safe, how to avoid alibaba scams, alibaba trade assurance not working, are alibaba reviews fake | ✅ |

---

## 4. Technical SEO — what's in place

Implemented in this codebase (Next.js App Router Metadata API — no plugin needed; this *is* the SEO layer):

- **`src/lib/site.ts`** — single source of truth for `SITE_URL` / `SITE_NAME` / OG image / `absoluteUrl()`.
- **`src/app/layout.tsx`** — `metadataBase`, title template `"%s · AlibabaScammer.com"`, keyword-aligned default title/description, OpenGraph + Twitter cards, `robots` (max-image-preview:large), optional Google verification meta, GA4 (`src/components/Analytics.tsx`).
- **`src/app/reports/[slug]/page.tsx`** — `generateMetadata` (unique title/description/canonical, OG `article` with published/modified time) + `Article` & `BreadcrumbList` JSON-LD. Shared DB query via React `cache()`.
- **`src/app/sitemap.ts`** — dynamic, one entry per approved report, `lastModified` from `updated_at`, hourly ISR.
- **`src/app/robots.ts`** — allow all, disallow `/admin` + `/api/`, points to sitemap.
- **`/reports`, `/submit-report`, `/admin`** — canonical + noindex handling as above.

**On-page rules (ongoing):**
- Every new page MUST set a unique `<title>`, `<meta description>`, and `canonical`.
- Use semantic HTML (`article`, `section`, one `<h1>`, ordered headings).
- Server-render anything that must be indexed (no client-only content for ranking pages).
- Internal-link generously: every report links to related reports + `/reports`; guides link to relevant reports.
- Use the words buyers search ("Alibaba scam", "Alibaba reviews") naturally — don't keyword-stuff, don't avoid them.
- Reports need genuine, detailed `details` text — thin reports rank for nothing.

---

## 5. Content roadmap

- **Now (Tier 1 + 2):** publish/approve real reports (each is a Tier-1 ranking asset); homepage + browse copy target Tier-2 head terms.
- **Next (Tier 3, Workstream D):** build guide/pillar pages — start with `is-alibaba-safe`, `how-to-avoid-alibaba-scams`, `alibaba-trade-assurance-not-working`, `are-alibaba-reviews-fake`. Each interlinks to reports.
- **Later:** category landing pages per industry (e.g. "Electronics Alibaba scams"); a purpose-built 1200×630 OG card (`/public/og-default.png`) replacing the interim hero image; optional per-report dynamic OG images.

---

## 6. Measurement

### Google Analytics 4 (shipped)
- Set `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` in Vercel (production). Loads only in production when set (`src/components/Analytics.tsx`).
- **GDPR note:** GA4 sets cookies; an EU consent banner may be needed. Decide before heavy EU traffic.

### Google Search Console (owner action — do this at launch)
1. Add **`alibabascammer.com` as a Domain property**; verify via **DNS TXT** (covers all subdomains, no code). *Alternative:* URL-prefix property using the `verification.google` meta tag — set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel.
2. Submit `https://alibabascammer.com/sitemap.xml`.
3. URL Inspection → Request Indexing for `/`, `/reports`, and a few report pages.
4. Watch **Coverage/Indexing** (are report pages indexed?) and **Performance** (queries, impressions, avg position).

### KPIs (review monthly)
- # report pages indexed (GSC Coverage).
- Impressions & clicks (GSC Performance), trend.
- Avg position for Tier-2 head terms: "alibaba scammer", "alibaba scam".
- # of Tier-1 queries we surface for (GSC query list).
- # reports published (supply drives Tier-1 coverage).

---

## 7. Tooling notes (MCP — optional, later)

Once GSC/GA4 have data, we can wire community **GSC** and **GA4 MCP servers** so ranking/traffic data can be pulled directly into working sessions for data-driven page fixes (e.g. "page X sits at position 11 for term Y — strengthen it"). Defer until the properties are populated. There is **no SEO "plugin"** to install — Next's Metadata API (section 4) is the SEO layer.

---

## 8. Verification checklist (after deploy)

- `robots.txt` and `sitemap.xml` resolve; sitemap lists every approved report.
- View-source a report page: unique title/description, canonical, `og:type=article`, absolute `og:image`, two `ld+json` blocks.
- `/reports?q=...` emits `noindex,follow` + canonical to `/reports`.
- **Google Rich Results Test** on a live report URL: `Article` + `Breadcrumb` parse with no errors.
- **Lighthouse SEO** → 100 on `/`, `/reports`, a report page.
