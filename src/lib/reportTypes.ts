export type ReportStatus = "pending" | "approved" | "rejected" | "retracted";

export type ReportUpdateStatus = "pending" | "approved" | "rejected";

export type Report = {
  id: string;
  // Drizzle returns Date for timestamp columns; serialized JSON returns string.
  // Accept both so DB rows cast to Report cleanly and JSON payloads still type-check.
  created_at: string | Date;
  updated_at: string | Date | null;
  platform: string;
  seller_name: string;
  seller_url: string;
  product_name: string;
  product_url: string;
  quantity: number | string;
  total_price: number | string;
  currency: string;
  industry: string;
  details: string;
  status: ReportStatus;
  slug: string;
  // Admin-set; drives the public "Purchase verified" badge.
  purchase_verified: boolean;
};

// NOTE: the sensitive submitter columns (submitter_email, manage_token_hash,
// claim_secret_hash, ...) are deliberately NOT on the public `Report` type.
// Code that needs them selects them explicitly so they can never ride along
// into a payload serialized to the browser. Use `typeof reports.$inferSelect`
// for the full internal row.

export type ReportInsert = {
  platform?: string;
  seller_name: string;
  seller_url: string;
  product_name: string;
  product_url: string;
  quantity: number;
  total_price: number;
  currency: string;
  industry: string;
  details: string;
  // Ordered R2 staging keys ("pending/<uuid>.webp") from /api/uploads.
  images?: string[];
};

export type ReportImage = {
  id: string;
  report_id: string;
  storage_key: string;
  content_type: string;
  size_bytes: number;
  position: number;
  kind: "evidence" | "receipt";
  created_at: string | Date;
};

// A submitter-appended note on an approved report, shown publicly once approved.
export type ReportUpdate = {
  id: string;
  report_id: string;
  body: string;
  status: ReportUpdateStatus;
  created_at: string | Date;
  updated_at: string | Date | null;
};

// Admin moderation queue payload: pending images are served via short-lived
// presigned URLs, never public ones.
export type AdminReportImage = {
  id: string;
  url: string;
  // Receipts may be PDFs; the admin UI renders those as a link instead of <img>.
  contentType: string;
};

// Another report that shares this one's seller URL or submitter email — shown to
// the moderator as a "possible duplicate" hint. Never auto-blocked: several
// genuine victims of the same seller is valuable corroboration.
export type AdminReportDuplicate = {
  id: string;
  slug: string;
  seller_name: string;
  status: ReportStatus;
};

// The admin payload deliberately omits the secret columns (manage_token_hash,
// claim_secret_hash, claim_expires_at) and the raw submitter_email — only
// derived, non-sensitive signals are sent to the moderation client.
export type AdminReport = Report & {
  images: AdminReportImage[];
  // Private order receipts (admin-only); never shown on the public page.
  receipts: AdminReportImage[];
  // Count of receipt rows on file, independent of whether they could be
  // presigned for preview — lets the UI tell "no receipt" apart from "receipt
  // exists but couldn't be loaded" (e.g. R2 unavailable).
  receipt_count: number;
  // Submitter's short "why no receipt" note (null if a receipt was attached).
  // Admin-only — never part of the public `Report` projection.
  no_receipt_reason: string | null;
  has_email: boolean;
  email_verified: boolean;
  possible_duplicates: AdminReportDuplicate[];
};
