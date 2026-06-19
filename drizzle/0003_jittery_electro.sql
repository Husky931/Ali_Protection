CREATE TABLE "rate_limits" (
	"bucket_key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "report_images" ADD COLUMN "kind" text DEFAULT 'evidence' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "submitter_email" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "manage_token_hash" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "claim_secret_hash" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "claim_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "purchase_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "terms_version" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "report_updates" ADD CONSTRAINT "report_updates_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rate_limits_expires_at_idx" ON "rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "report_updates_report_id_idx" ON "report_updates" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "reports_submitter_email_idx" ON "reports" USING btree ("submitter_email");