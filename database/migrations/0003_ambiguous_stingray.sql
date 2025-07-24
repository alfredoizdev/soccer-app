CREATE TYPE "public"."post_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" "post_status" DEFAULT 'pending' NOT NULL;