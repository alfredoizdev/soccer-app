import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
} from 'drizzle-orm/pg-core'

export const STATUS_ENUM = pgEnum('status', ['active', 'inactive'])
export const ROLE_ENUM = pgEnum('role', ['admin', 'user'])
export const POST_STATUS_ENUM = pgEnum('post_status', [
  'pending',
  'approved',
  'rejected',
])

export const usersTable = pgTable('users', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'), // Nuevo campo avatar
  organizationId: uuid('organization_id').references(
    () => organizationsTable.id
  ), // Nuevo campo organizationId
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  password: text('password').notNull(),
  status: STATUS_ENUM('status').notNull().default('active'),
  role: ROLE_ENUM('role').notNull().default('user'),
})

export const organizationsTable = pgTable('organizations', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  name: text('name').notNull(),
  description: text('description'),
  avatar: text('avatar'), // Campo avatar para la organización
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const playersTable = pgTable('players', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  age: integer('age').notNull(),
  avatar: text('avatar'), // Nuevo campo avatar
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(
    () => organizationsTable.id,
    { onDelete: 'set null' }
  ), // Nuevo campo organizationId, opcional
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  // Campos acumulativos de stats
  totalGoals: integer('total_goals').default(0).notNull(),
  totalAssists: integer('total_assists').default(0).notNull(),
  totalPassesCompleted: integer('total_passes_completed').default(0).notNull(),
  jerseyNumber: integer('jersey_number'), // Nuevo campo para el dorsal
  position: text('position'), // Temporalmente opcional para migración
})

// Tabla de partidos
export const matchesTable = pgTable('matches', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  team1Id: uuid('team1_id').notNull(),
  team2Id: uuid('team2_id').notNull(),
  team1Goals: integer('team1_goals').default(0).notNull(), // Goles equipo 1
  team2Goals: integer('team2_goals').default(0).notNull(), // Goles equipo 2
  duration: integer('duration'), // Duración del partido en segundos
  status: STATUS_ENUM('status').notNull().default('active'), // Estado del partido
  location: text('location'), // Dirección del partido
  // Puedes agregar más campos según necesidad
})

// Tabla de stats por partido y jugador
export const playerStatsTable = pgTable('player_stats', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  playerId: uuid('player_id')
    .notNull()
    .references(() => playersTable.id, { onDelete: 'cascade' }),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' }),
  minutesPlayed: integer('minutes_played').default(0).notNull(),
  goals: integer('goals').default(0).notNull(),
  assists: integer('assists').default(0).notNull(),
  passesCompleted: integer('passes_completed').default(0).notNull(),
  goalsAllowed: integer('goals_allowed').default(0).notNull(), // Nuevo campo
  goalsSaved: integer('goals_saved').default(0).notNull(), // Nuevo campo
  // Puedes agregar más stats si necesitas
})

// Nueva tabla para datos en vivo del partido
export const liveMatchDataTable = pgTable('live_match_data', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' }),
  playerId: uuid('player_id')
    .notNull()
    .references(() => playersTable.id, { onDelete: 'cascade' }),
  isPlaying: boolean('is_playing').default(true).notNull(),
  timePlayed: integer('time_played').default(0).notNull(), // en segundos
  goals: integer('goals').default(0).notNull(),
  assists: integer('assists').default(0).notNull(),
  passesCompleted: integer('passes_completed').default(0).notNull(),
  goalsAllowed: integer('goals_allowed').default(0).notNull(),
  goalsSaved: integer('goals_saved').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Tabla para datos en vivo del partido (marcador)
export const liveMatchScoreTable = pgTable('live_match_score', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' })
    .unique(), // Solo un registro por partido
  team1Goals: integer('team1_goals').default(0).notNull(),
  team2Goals: integer('team2_goals').default(0).notNull(),
  isLive: boolean('is_live').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Tabla para eventos del partido (goles, tarjetas, sustituciones, etc.)
export const matchEventsTable = pgTable('match_events', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' }),
  playerId: uuid('player_id').references(() => playersTable.id, {
    onDelete: 'set null',
  }),
  eventType: text('event_type').notNull(), // 'goal', 'assist', 'yellow_card', 'red_card', 'substitution', 'injury'
  minute: integer('minute').notNull(), // Minuto del evento
  teamId: uuid('team_id')
    .notNull()
    .references(() => organizationsTable.id, { onDelete: 'cascade' }),
  description: text('description'), // Descripción opcional del evento
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const postsTable = pgTable('posts', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'), // 'image' o 'video'
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  status: POST_STATUS_ENUM('status').notNull().default('pending'),
})

// Tabla para sesiones de streaming
export const streamingSessionsTable = pgTable('streaming_sessions', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' }),
  broadcasterId: uuid('broadcaster_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true).notNull(),
  streamKey: text('stream_key').notNull().unique(),
  title: text('title'),
  description: text('description'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Tabla para conexiones WebRTC
export const webrtcConnectionsTable = pgTable('webrtc_connections', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => streamingSessionsTable.id, { onDelete: 'cascade' }),
  viewerId: uuid('viewer_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  connectionId: text('connection_id').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect

// export type InsertPost = typeof postsTable.$inferInsert;
// export type SelectPost = typeof postsTable.$inferSelect;

export type InsertPlayer = typeof playersTable.$inferInsert
export type SelectPlayer = typeof playersTable.$inferSelect
