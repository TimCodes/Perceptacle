/**
 * Database connection setup using Drizzle ORM and PostgreSQL.
 * Configures connection pool and exports database instance.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

/** PostgreSQL connection string from environment or default */
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/perceptacle_dev';

const sql = postgres(connectionString);

/** Drizzle database instance with schema */
export const db = drizzle(sql, { schema });

/** Closes database connection pool */
export const closeDatabase = () => {
  sql.end();
};
