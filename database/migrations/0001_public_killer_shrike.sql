CREATE TABLE "live_match_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"is_playing" boolean DEFAULT true NOT NULL,
	"time_played" integer DEFAULT 0 NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"passes_completed" integer DEFAULT 0 NOT NULL,
	"duels_won" integer DEFAULT 0 NOT NULL,
	"duels_lost" integer DEFAULT 0 NOT NULL,
	"goals_allowed" integer DEFAULT 0 NOT NULL,
	"goals_saved" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "live_match_data_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "live_match_score" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"team1_goals" integer DEFAULT 0 NOT NULL,
	"team2_goals" integer DEFAULT 0 NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "live_match_score_id_unique" UNIQUE("id"),
	CONSTRAINT "live_match_score_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
ALTER TABLE "live_match_data" ADD CONSTRAINT "live_match_data_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_match_data" ADD CONSTRAINT "live_match_data_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_match_score" ADD CONSTRAINT "live_match_score_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;