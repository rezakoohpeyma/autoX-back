import { users } from "../infrastructure/persistence/drizzle/schema/users.schema";

export type UserRow = typeof users.$inferSelect;
