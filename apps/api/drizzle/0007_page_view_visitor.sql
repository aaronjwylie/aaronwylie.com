ALTER TABLE "page_views" ADD COLUMN "visitor_hash" varchar(16);--> statement-breakpoint
CREATE INDEX "page_views_visitor_idx" ON "page_views" ("day","visitor_hash");
