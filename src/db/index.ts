import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ CRITICAL: DATABASE_URL is NOT defined in environment variables!");
} else {
  const masked = connectionString.replace(/:[^@:]+@/, ":****@");
  console.log("🛠️ DB Connection String:", masked);
}

// Configure connection pool to prevent exhaustion
// For Supabase: use connection pooling URL if available, otherwise limit max connections
const isSupabase = connectionString?.includes("supabase.co");
const maxConnections = isSupabase ? 10 : 20; // Lower for Supabase free tier

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString || "", {
  prepare: false,
  max: maxConnections,
  idle_timeout: 20,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
