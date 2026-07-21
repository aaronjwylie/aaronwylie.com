CREATE TABLE IF NOT EXISTS "monitor_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"monitor_id" integer NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ok" boolean NOT NULL,
	"status_code" integer,
	"response_ms" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"host" varchar(255) NOT NULL,
	"permanent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "monitors_url_unique" UNIQUE("url")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monitor_checks" ADD CONSTRAINT "monitor_checks_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monitor_checks_monitor_idx" ON "monitor_checks" USING btree ("monitor_id","checked_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monitors_expires_idx" ON "monitors" USING btree ("expires_at");