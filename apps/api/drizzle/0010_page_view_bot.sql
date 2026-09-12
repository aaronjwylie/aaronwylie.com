ALTER TABLE "page_views" ADD COLUMN "is_bot" boolean;--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "bot_name" varchar(64);