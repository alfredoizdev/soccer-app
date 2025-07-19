-- Script para hacer drop de todas las tablas en Neon
-- Ejecutar esto antes de aplicar las migraciones

-- Drop tables in reverse order (dependencies first)
DROP TABLE IF EXISTS match_events CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop enums
DROP TYPE IF EXISTS role CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;

-- Reset sequences if any
-- (PostgreSQL will handle this automatically)

-- Verify tables are dropped
SELECT 'Tables dropped successfully' as status; 