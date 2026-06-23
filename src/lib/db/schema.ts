import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
    platform: text("platform").default("alibaba").notNull(),
    seller_name: text("seller_name").notNull(),
    seller_url: text("seller_url").notNull(),
    product_name: text("product_name").notNull(),
    product_url: text("product_url").notNull(),
    quantity: numeric("quantity").notNull(),
    total_price: numeric("total_price").notNull(),
    currency: text("currency").notNull(),
    industry: text("industry").notNull(),
    details: text("details").notNull(),
    // 'retracted' = submitter took down their own approved report. Like
    // 'rejected', it is excluded from every public read (all of which filter
    // status='approved'), so a retract instantly 404s the page.
    status: text("status", {
      enum: ["pending", "approved", "rejected", "retracted"],
    })
      .default("pending")
      .notNull(),
    slug: text("slug").notNull().unique(),

    // --- Optional submitter identity (set only if they opt in after submitting) ---
    // No accounts/passwords: the email + a hashed capability token is the identity.
    submitter_email: text("submitter_email"),
    // True once they click the emailed manage link at least once — possession of
    // the token IS proof of email ownership, so no separate verification secret.
    email_verified: boolean("email_verified").default(false).notNull(),
    // sha256 of the durable manage-link token. Null until they attach an email.
    manage_token_hash: text("manage_token_hash"),
    // sha256 of the one-time claim secret returned by POST /api/reports.
    // Single-use + short-lived: required to attach an email to a fresh report,
    // then nulled out on use (see claim_expires_at).
    claim_secret_hash: text("claim_secret_hash"),
    claim_expires_at: timestamp("claim_expires_at", { withTimezone: true }),

    // Admin-set after reviewing a private order receipt → drives the public
    // "Purchase verified" badge. The receipt image itself is never public.
    purchase_verified: boolean("purchase_verified").default(false).notNull(),

    // Short submitter-supplied explanation for why no order receipt was
    // attached (e.g. "paid by bank transfer", "lost the invoice"). Null when a
    // receipt was uploaded. Private/admin-only — surfaced to the moderator to
    // weigh an unverified report; deliberately kept OUT of the public column
    // projection (see reportSelect.ts) so it never reaches the browser.
    no_receipt_reason: text("no_receipt_reason"),

    // Truthfulness/terms acceptance captured at submit time (legal posture).
    terms_version: text("terms_version"),
    terms_accepted_at: timestamp("terms_accepted_at", { withTimezone: true }),
  },
  (table) => [
    // Covers the hot public read path: filter status='approved' + sort newest-first.
    // Also serves the admin queue (status='pending'). created_at is descending to
    // match `.orderBy(desc(reports.created_at))` so Postgres skips the sort step.
    index("reports_status_created_at_idx").on(
      table.status,
      table.created_at.desc(),
    ),
    // Email-recovery ("resend my link") and dedup-by-email lookups.
    index("reports_submitter_email_idx").on(table.submitter_email),
  ],
);

export const report_images = pgTable(
  "report_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    report_id: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    // R2 object key, e.g. "pending/<uuid>.webp" before approval,
    // "reports/<report_id>/<position>.webp" once published.
    storage_key: text("storage_key").notNull().unique(),
    content_type: text("content_type").notNull(),
    size_bytes: integer("size_bytes").notNull(),
    position: integer("position").notNull().default(0),
    // 'evidence' photos are copied to the public reports/ prefix on approval and
    // shown publicly. 'receipt' images (order receipts, contain buyer PII) live
    // under the private receipts/ prefix, are never published, and are viewable
    // only by admins via short-lived presigned URLs.
    kind: text("kind", { enum: ["evidence", "receipt"] })
      .default("evidence")
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("report_images_report_id_idx").on(table.report_id)],
);

// Submitter-appended "Update:" notes on an already-approved report (e.g. "the
// seller refunded me"). The approved report text itself is frozen; these notes
// go through the same admin moderation gate before appearing publicly.
export const report_updates = pgTable(
  "report_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    report_id: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .default("pending")
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [index("report_updates_report_id_idx").on(table.report_id)],
);

// Persisted, fixed-window rate limiter. Replaces the old in-memory Map, which
// was per-lambda and reset on every cold start (useless on serverless). One row
// per (scope, hashed-ip, time-bucket); incremented atomically via an upsert.
export const rate_limits = pgTable(
  "rate_limits",
  {
    // e.g. "reports:<sha256(ip+salt)>:<hourBucket>"
    bucket_key: text("bucket_key").primaryKey(),
    count: integer("count").notNull().default(0),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("rate_limits_expires_at_idx").on(table.expires_at)],
);
