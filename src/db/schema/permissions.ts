import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", {
    length: 100,
  })
    .notNull()
    .unique(),

  description: text("description"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});