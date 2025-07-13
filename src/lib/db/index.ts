// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Configure connection pooling for better performance
neonConfig.fetchConnectionCache = true;

// Validate database URL
const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('NEXT_PUBLIC_DATABASE_URL environment variable is required');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});