import { reports } from "@/lib/db/schema";

// Explicit public column projection. Public reads MUST use this instead of
// `db.select()` so the secret submitter columns (submitter_email,
// manage_token_hash, claim_secret_hash, claim_expires_at, terms_*) can never
// ride a select(*) into a payload that gets serialized to the browser (e.g. via
// the client-side ReportRow component). The shape matches the public `Report`.
export const publicReportColumns = {
  id: reports.id,
  created_at: reports.created_at,
  updated_at: reports.updated_at,
  platform: reports.platform,
  seller_name: reports.seller_name,
  seller_url: reports.seller_url,
  product_name: reports.product_name,
  product_url: reports.product_url,
  quantity: reports.quantity,
  total_price: reports.total_price,
  currency: reports.currency,
  industry: reports.industry,
  details: reports.details,
  status: reports.status,
  slug: reports.slug,
  purchase_verified: reports.purchase_verified,
};
