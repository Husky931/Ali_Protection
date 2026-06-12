export type ReportStatus = "pending" | "approved" | "rejected";

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
};

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
  created_at: string | Date;
};

// Admin moderation queue payload: pending images are served via short-lived
// presigned URLs, never public ones.
export type AdminReportImage = {
  id: string;
  url: string;
};

export type AdminReport = Report & {
  images: AdminReportImage[];
};
