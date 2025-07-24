ALTER TABLE "posts" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "media_type" text;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "image";