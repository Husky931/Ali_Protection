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
};
