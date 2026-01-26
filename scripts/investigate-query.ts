import "dotenv/config";
import { db } from "../src/db";
import { workspaces, workspaceMembers } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function investigate() {
  const userId = "user_38kVDHyxrvjhKZh0BdEMic63JfP";
  console.log(`Investigating query for user: ${userId}`);

  try {
    const results = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, userId));

    console.log("Query success!", results);
  } catch (error) {
    console.error("Query failed with error:");
    console.error(error);
  }
  process.exit(0);
}

investigate();
