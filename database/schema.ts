import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const STATUS_ENUM = pgEnum('status', ['active', 'inactive'])
export const ROLE_ENUM = pgEnum('role', ['admin', 'user'])

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

export const childrenTable = pgTable('children', {
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
  totalDuelsWon: integer('total_duels_won').default(0).notNull(),
  totalDuelsLost: integer('total_duels_lost').default(0).notNull(),
})

// Tabla de partidos
export const matchesTable = pgTable('matches', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  team1Id: uuid('team1_id').notNull(),
  team2Id: uuid('team2_id').notNull(),
  // Puedes agregar más campos según necesidad
})

// Tabla de stats por partido y jugador
export const playerStatsTable = pgTable('player_stats', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  playerId: uuid('player_id')
    .notNull()
    .references(() => childrenTable.id, { onDelete: 'cascade' }),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' }),
  minutesPlayed: integer('minutes_played').default(0).notNull(),
  goals: integer('goals').default(0).notNull(),
  assists: integer('assists').default(0).notNull(),
  passesCompleted: integer('passes_completed').default(0).notNull(),
  duelsWon: integer('duels_won').default(0).notNull(),
  duelsLost: integer('duels_lost').default(0).notNull(),
  // Puedes agregar más stats si necesitas
})

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect

// export type InsertPost = typeof postsTable.$inferInsert;
// export type SelectPost = typeof postsTable.$inferSelect;

export type InsertChild = typeof childrenTable.$inferInsert
export type SelectChild = typeof childrenTable.$inferSelect
