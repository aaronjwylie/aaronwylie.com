ALTER TABLE "page_views" ADD COLUMN "country" varchar(64);--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "city" varchar(128);
