import { sql } from "drizzle-orm";
import {
	pgTable,
	boolean,
	varchar,
	timestamp,
	text,
	integer,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	email: varchar("email", { length: 255 }),
	password: text("password").notNull(),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' })
            .defaultNow()
            .notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),

	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, 
(table) => {
		return {
			emailUniqueIdx: uniqueIndex("users_email_unique_idx")
				.on(table.email)
				.where(sql`${table.deletedAt} IS NULL`),

			phoneUniqueIdx: uniqueIndex("users_phone_unique_idx")
				.on(table.phoneNumber)
				.where(sql`${table.deletedAt} IS NULL`),
		};
	},
);
