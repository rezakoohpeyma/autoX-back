import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name', {
    length: 50,
  }).notNull().unique(),

  description: text('description'),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
});