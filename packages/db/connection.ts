import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL environment variable is required');

export const db = drizzle(databaseUrl, { schema });
export * from './schema.js';
