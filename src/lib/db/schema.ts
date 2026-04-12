import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

export const reports = pgTable("reports", {
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
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
});
