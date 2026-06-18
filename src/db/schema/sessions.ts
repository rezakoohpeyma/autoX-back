import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable('sessions', {
  id: uuid('id')
    .primaryKey()
    .defaultRandom(),

  userId: uuid('user_id')
    .references(() => users.id, {
      onDelete: 'cascade',
    })
    .notNull(),

  refreshTokenHash: text(
    'refresh_token_hash',
  ).notNull(),

  deviceName: varchar(
    'device_name',
    { length: 255 },
  ),

  userAgent: text('user_agent'),

  ipAddress: varchar(
    'ip_address',
    { length: 45 },
  ),

  expiresAt: timestamp(
    'expires_at',
  ).notNull(),

  lastUsedAt: timestamp(
    'last_used_at',
  )
    .defaultNow()
    .notNull(),

  revokedAt: timestamp(
    'revoked_at',
  ),

  createdAt: timestamp(
    'created_at',
  )
    .defaultNow()
    .notNull(),
});