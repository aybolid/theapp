CREATE TABLE "accesses" (
	"access_id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL UNIQUE,
	"admin" boolean DEFAULT false NOT NULL,
	"wishes" boolean DEFAULT false NOT NULL,
	"f1" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "accesses" ADD CONSTRAINT "accesses_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
DROP TYPE "user_role";
