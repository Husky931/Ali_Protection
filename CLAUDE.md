<package_manager> This project uses **pnpm**. Source of truth is `pnpm-lock.yaml`, and pnpm </package_manager>

<db_migrations>

The DB is **Neon Postgres** via **Drizzle**. Schema lives in `src/lib/db/schema.ts`; generated SQL migrations in `drizzle/`; applied-migration tracking in `drizzle.__drizzle_migrations`.

**Rule — whenever the schema changes, or at the start of DB work, check for unapplied migrations and apply them:**

1. After editing `schema.ts`, generate the migration: `pnpm drizzle-kit generate`.
2. Check whether migrations in `drizzle/` are applied: compare the `.sql` files against rows in `drizzle.__drizzle_migrations` (a migration is applied iff the sha256 of its `.sql` file content is present as a `hash`). If any are missing, apply them.
3. Verify the change actually landed in the DB (e.g. `pg_indexes`, `EXPLAIN`), don't assume.

**Two gotchas in this repo (do not skip):**

- **Env file mismatch.** `drizzle.config.ts` does `import "dotenv/config"`, which loads `.env` — but `DATABASE_URL` lives in `.env.local` (Next.js loads that automatically; drizzle-kit does not). Load it first: `set -a && . ./.env.local && set +a && pnpm drizzle-kit ...`
- **`drizzle-kit migrate` hangs here.** It uses the `@neondatabase/serverless` **websocket** driver, which stalls in this environment. The **HTTP** driver (`neon(process.env.DATABASE_URL)`) works fine. Apply/verify migrations through a small Node script using the HTTP driver instead of `drizzle-kit migrate`. Use `CREATE INDEX IF NOT EXISTS` etc. to stay idempotent, and insert the migration's hash into `drizzle.__drizzle_migrations` so the tracking table stays consistent.

Note: migration `0000` was originally applied via `drizzle-kit push`, so the tracking table was empty until `0001`; both hashes are now recorded.

</db_migrations>

<site_overview> A community-driven, public database of fraud reports about scam sellers on Alibaba.com. Buyers who got burned submit a report; an admin reviews and approves it; the report becomes a public, SEO-indexed page. The goal is that when someone Googles a seller's name before placing an order, our report shows up and warns them. </site_overview>

<site_functionality>

1. **Submit a report** — anonymous form: seller name, Alibaba seller URL, product, quantity, total paid, currency, industry, and the full story of what happened.
2. **Moderation** — every report is reviewed by an admin before it goes public. Nothing is published unsanitized.
3. **Browse & search** — homepage lists approved reports with a search box (by seller, product, keyword).
4. **Per-report pages** — each report lives at its own URL with the seller's name in the slug, optimized to rank for "[seller name] scam" and "[product] alibaba review" queries. </site_functionality />

<features_for_later>

- User accounts / login
- Paywall, pricing tiers, "Pro" plan (a $3 paywall is a _future_ idea, not landing-page material)
- Forums, comments, upvotes
- Generic "trust badges" from invented certifications _submit a report_ or _browse reports_ </features_for_later>

<analytics_and_search_console_mcp>

Two MCP servers are configured in `.mcp.json` to pull SEO data in-session:

| Server | Command | Data |
| --- | --- | --- |
| `gsc` | `npx -y mcp-server-gsc` | Search Console: impressions, clicks, position, queries |
| `ga4` | `~/.local/share/ga4-mcp/venv/bin/analytics-mcp` (official Google `analytics-mcp`, Python venv) | GA4: users, traffic, events |

- **Auth = user OAuth as `pecevgligor@gmail.com`** (owner of both properties), not a service account. Both read `GOOGLE_APPLICATION_CREDENTIALS=~/.config/alibabascammer/user_creds.json` (an `authorized_user` file with a refresh token; scopes `webmasters.readonly` + `analytics.readonly` — read-only). `ga4` also sets `GOOGLE_PROJECT_ID=forum-364710` (quota project).
- **Why OAuth, not a service account:** a Google bug (since ~April 2026) blocks granting service accounts created after that date GSC/GA4 access ("email doesn't match a Google Account"). The dead SA `alibabascammer-mcp@forum-364710…` + its key `~/.config/alibabascammer/service-account.json` are unused — safe to delete.
- **Property IDs:** GSC `sc-domain:alibabascammer.com`; GA4 `properties/536023127` (account "Alibaba Scammers").
- **Read-only:** these creds can't write — submit sitemaps / request indexing in the GSC UI instead.
- **GA4 tag** (separate from the MCP): `src/components/Analytics.tsx`, measurement ID `G-1SFG73Q6NB`, loads in production only.
- **Re-auth** (only if the refresh token dies; the OAuth app is published "In production," so it shouldn't): re-run an `InstalledAppFlow` against `~/.config/alibabascammer/oauth_client.json` for the two scopes, writing `user_creds.json`.

</analytics_and_search_console_mcp>
