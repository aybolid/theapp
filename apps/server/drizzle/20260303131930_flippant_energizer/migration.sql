CREATE TYPE "user_role" AS ENUM('admin', 'viewer');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "profiles" (
	"profile_id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL UNIQUE,
	"name" varchar DEFAULT 'Unknown User' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"picture" varchar DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_id" varchar(255) PRIMARY KEY,
	"secret_hash" bytea NOT NULL,
	"user_id" uuid NOT NULL,
	"ua_data" jsonb DEFAULT '{"ua":"","browser":{},"cpu":{},"device":{},"engine":{},"os":{}}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"role" "user_role" DEFAULT 'viewer'::"user_role" NOT NULL,
	"status" "user_status" DEFAULT 'inactive'::"user_status" NOT NULL,
	"email" varchar NOT NULL UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishes" (
	"wish_id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"owner_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"link" varchar NOT NULL,
	"reserver_id" uuid,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_owner_id_users_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_reserver_id_users_user_id_fkey" FOREIGN KEY ("reserver_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;