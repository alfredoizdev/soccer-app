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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// export const postsTable = pgTable('posts_table', {
//   id: serial('id').primaryKey(),
//   title: text('title').notNull(),
//   content: text('content').notNull(),
//   userId: integer('user_id')
//     .notNull()
//     .references(() => usersTable.id, { onDelete: 'cascade' }),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at')
//     .notNull()
//     .$onUpdate(() => new Date()),
// });

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect

// export type InsertPost = typeof postsTable.$inferInsert;
// export type SelectPost = typeof postsTable.$inferSelect;
