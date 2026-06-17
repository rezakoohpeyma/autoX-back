import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  phoneNumber: varchar("phone_number", {
    length: 20,
  })
    .notNull()
    .unique(),

  passwordHash: text("password_hash"),

  firstName: varchar("first_name", {
    length: 100,
  }),

  lastName: varchar("last_name", {
    length: 100,
  }),

  isPhoneVerified: boolean("is_phone_verified")
    .default(false)
    .notNull(),

  isActive: boolean("is_active")
    .default(true)
    .notNull(),

  lastLoginAt: timestamp("last_login_at"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});