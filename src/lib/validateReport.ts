import { ReportInsert } from "@/lib/reportTypes";

// product_url is intentionally absent — the form labels it optional.
const requiredTextFields = [
  "seller_name",
  "seller_url",
  "product_name",
  "currency",
  "industry",
  "details",
] as const;

export type ValidatedReportFields = {
  quantity: number;
  totalPrice: number;
};

export type ValidateResult =
  | { ok: true; values: ValidatedReportFields }
  | { ok: false; errors: string[] };

/**
 * Validates the core report fields shared by submission (POST /api/reports) and
 * pending-edit (PATCH /api/manage/[id]). A pending edit is indistinguishable
 * from a fresh submission for moderation purposes, so both paths must apply the
 * exact same rules — hence this is extracted rather than duplicated.
 */
export function validateReportFields(body: Partial<ReportInsert>): ValidateResult {
  const errors: string[] = [];

  for (const field of requiredTextFields) {
    const value = body[field as keyof ReportInsert];
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${field} is required.`);
    }
  }

  const quantity = Number(body.quantity);
  const totalPrice = Number(body.total_price);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push("quantity must be a positive number.");
  }
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    errors.push("total_price must be a positive number.");
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, values: { quantity, totalPrice } };
}
