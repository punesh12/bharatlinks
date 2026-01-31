"use server";

import { db } from "@/db";
import { users, workspaceMembers, workspaces } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { canCreateWorkspace } from "@/lib/utils/plans";

export const createWorkspace = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  if (!name) throw new Error("Name is required");

  // Check workspace limit
  const limitCheck = await canCreateWorkspace();
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason || "Workspace limit reached");
  }

  // Ensure user exists in our DB (sync if needed)
  // In a real app, use webhooks. Here we just upsert for safety on action.
  await db
    .insert(users)
    .values({ id: user.id, email: user.emailAddresses[0].emailAddress })
    .onConflictDoNothing();

  const [workspace] = await db.insert(workspaces).values({ name, ownerId: user.id }).returning();

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role: "owner",
  });

  revalidatePath("/app");
  return workspace;
};

export const getWorkspaces = async () => {
  const { userId } = await auth();
  if (!userId) return [];

  // Get workspaces where user is a member
  const results = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId));

  return results;
};

export const getOrCreateFirstWorkspace = async () => {
  // Helper to ensure user has at least one workspace to land on
  const list = await getWorkspaces();
  if (list.length > 0) return list[0];

  // If none, create "Personal"
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .insert(users)
    .values({ id: user.id, email: user.emailAddresses[0].emailAddress })
    .onConflictDoNothing();

  const [workspace] = await db
    .insert(workspaces)
    .values({ name: "Personal", ownerId: user.id })
    .returning();

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role: "owner",
  });

  return { id: workspace.id, name: workspace.name, role: "owner" };
};
