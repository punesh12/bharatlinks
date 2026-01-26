import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

async function main() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    console.log("Env path:", envPath);
    console.log("File exists:", fs.existsSync(envPath));
    if (fs.existsSync(envPath)) {
      console.log("File content snippet:", fs.readFileSync(envPath, "utf8").substring(0, 50));
    }

    console.log("Current DATABASE_URL:", process.env.DATABASE_URL);

    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("@/db");

    console.log("Connecting to DB...");
    const result = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    console.log(
      "Tables found:",
      result.map((r) => r.table_name)
    );

    console.log("Checking workspace_members table schema...");
    const members = await db.execute(sql`SELECT * FROM workspace_members LIMIT 1`);
    console.log("Workspace members check:", members);

    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

main();
