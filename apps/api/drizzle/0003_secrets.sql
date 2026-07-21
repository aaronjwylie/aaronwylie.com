CREATE TABLE IF NOT EXISTS "secrets" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"ciphertext" text NOT NULL,
	"iv" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "secrets_expires_idx" ON "secrets" USING btree ("expires_at");