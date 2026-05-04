CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"platform" text DEFAULT 'alibaba' NOT NULL,
	"seller_name" text NOT NULL,
	"seller_url" text NOT NULL,
	"product_name" text NOT NULL,
	"product_url" text NOT NULL,
	"quantity" numeric NOT NULL,
	"total_price" numeric NOT NULL,
	"currency" text NOT NULL,
	"industry" text NOT NULL,
	"details" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "reports_slug_unique" UNIQUE("slug")
);
