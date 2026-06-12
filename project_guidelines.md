# Project Guidelines

## What This Project Is

A community-driven fraud reporting platform for Alibaba buyers. Users submit reports about scam sellers, an admin reviews and approves them, and approved reports become publicly visible to warn future buyers.

## Goal

Build a trusted, searchable database of fraudulent Alibaba sellers that ranks well in search engines. When someone Googles a seller name before buying, our report page should appear.

## Strategy

SEO is the primary growth channel. Every feature decision should be evaluated through the lens of: **does this help us rank higher or attract more organic traffic?**

- Each report has its own page (`/reports/[slug]`) with unique metadata targeting "[seller name] scam" and "[product name] alibaba review" queries.
- Content quality matters — reports should be detailed and genuine.
- Page speed, clean HTML, proper heading hierarchy, and structured metadata all contribute to rankings.

## Development Guidelines

### Adding Features

- Keep it simple. If a feature doesn't directly serve the user experience or SEO, defer it.
- No unnecessary abstractions, wrappers, or over-engineering. This is a small, fast-moving project.
- New pages should always include proper `<title>`, `<meta description>`, and OpenGraph tags.
- Any user-facing text change should consider how it reads to both humans and search crawlers.

### Security

- All public form submissions are rate limited (per-IP).
- Reports are moderated — nothing goes public without admin approval.
- Sanitize and validate all user input server-side. Never trust the client.
- Admin routes require the `ADMIN_PASSWORD` header. Keep this credential out of version control.

### SEO Priorities

- Individual report pages are the most important asset. Optimize their content, metadata, and internal linking.
- Homepage should load fast and surface the report list with search functionality.
- Use semantic HTML (`article`, `section`, proper heading levels).
- Avoid client-side-only rendering for content that needs to be indexed — use server components.
- Monitor: page speed, indexing status, and organic keyword rankings.

### Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Drizzle ORM + Neon (PostgreSQL)
- Deployed on Vercel (planned)

### Future (Not Now)

- Paywall: $3 to access the full seller list (only after organic traffic is established).
- User accounts are not planned for v1. Reports are anonymous.
