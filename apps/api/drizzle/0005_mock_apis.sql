CREATE TABLE "mock_apis" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mock_apis_expires_idx" ON "mock_apis" ("expires_at");
