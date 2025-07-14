CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"team1_id" uuid NOT NULL,
	"team2_id" uuid NOT NULL,
	CONSTRAINT "matches_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "player_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"minutes_played" integer DEFAULT 0 NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"passes_completed" integer DEFAULT 0 NOT NULL,
	"duels_won" integer DEFAULT 0 NOT NULL,
	"duels_lost" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "player_stats_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "total_goals" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "total_assists" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "total_passes_completed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "total_duels_won" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "total_duels_lost" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_id_children_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;