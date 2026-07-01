import {
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "../../../../../users/infrastructure/persistence/drizzle/schema/users.schema";

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	hash: varchar("hash", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	deletedAt: timestamp("deleted_at"),
});
