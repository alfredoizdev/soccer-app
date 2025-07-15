CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"age" integer NOT NULL,
	"avatar" text,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"total_goals" integer DEFAULT 0 NOT NULL,
	"total_assists" integer DEFAULT 0 NOT NULL,
	"total_passes_completed" integer DEFAULT 0 NOT NULL,
	"total_duels_won" integer DEFAULT 0 NOT NULL,
	"total_duels_lost" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "players_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "children" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "children" CASCADE;--> statement-breakpoint
-- ALTER TABLE "player_stats" DROP CONSTRAINT "player_stats_player_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;