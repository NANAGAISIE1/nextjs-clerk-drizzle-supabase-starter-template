import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { exit } from "process";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

// for migrations
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
await migrate(drizzle(migrationClient), {
  migrationsFolder: "./supabase/migrations",
});
console.log("migration complete");
exit();
