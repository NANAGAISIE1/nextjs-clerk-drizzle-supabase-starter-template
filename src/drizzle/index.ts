import * as schema from "././db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be a Neon postgres connection string");
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
