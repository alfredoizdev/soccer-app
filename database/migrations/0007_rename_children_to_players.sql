-- Rename table 'children' to 'players'
ALTER TABLE "children" RENAME TO "players";

-- Add new foreign key constraint to 'players'
ALTER TABLE "player_stats"
  ADD CONSTRAINT "player_stats_player_id_players_id_fk"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE; 