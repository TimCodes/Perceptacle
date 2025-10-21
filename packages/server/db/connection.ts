import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/perceptacle_dev';

const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });

// Close database connection
export const closeDatabase = () => {
  sql.end();
};
