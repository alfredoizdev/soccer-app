ALTER TABLE "live_match_data" DROP COLUMN "duels_won";--> statement-breakpoint
ALTER TABLE "live_match_data" DROP COLUMN "duels_lost";--> statement-breakpoint
ALTER TABLE "player_stats" DROP COLUMN "duels_won";--> statement-breakpoint
ALTER TABLE "player_stats" DROP COLUMN "duels_lost";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "total_duels_won";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "total_duels_lost";