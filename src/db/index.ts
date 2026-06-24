import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
	connectionString,
	max: 10, // important for production
	idleTimeoutMillis: 30000,
});

export const db = drizzle(pool);
export type DB = typeof db;
