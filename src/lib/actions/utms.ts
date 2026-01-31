"use server";

import { db } from "@/db";
import { utmTemplates, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentUser, auth } from "@clerk/nextjs/server";

/**
 * Check if user is a member of a workspace
 */
const isWorkspaceMember = async (workspaceId: string, userId: string): Promise<boolean> => {
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  return !!member;
};

export const createUtmTemplate = async (formData: FormData, workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, user.id))) {
    throw new Error("You don't have access to this workspace");
  }

  const name = formData.get("name") as string;
  const source = formData.get("source") as string;
  const medium = formData.get("medium") as string;
  const campaign = formData.get("campaign") as string;

  await db.insert(utmTemplates).values({
    workspaceId,
    name,
    source,
    medium,
    campaign,
  });

  revalidatePath(`/app/${workspaceId}/settings`);
};

export const getUtmTemplates = async (workspaceId: string) => {
  const { userId } = await auth();
  if (!userId) return [];

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, userId))) {
    return [];
  }

  return await db.select().from(utmTemplates).where(eq(utmTemplates.workspaceId, workspaceId));
};
