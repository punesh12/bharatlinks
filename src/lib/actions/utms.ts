"use server";

import { db } from "@/db";
import { utmTemplates, workspaceMembers } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentUser, auth } from "@clerk/nextjs/server";
import { canCreateUtmTemplate } from "@/lib/utils/plans";

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

  // Check UTM template limit
  const limitCheck = await canCreateUtmTemplate(workspaceId);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason || "UTM template limit reached");
  }

  const name = formData.get("name") as string;
  const source = formData.get("source") as string;
  const medium = formData.get("medium") as string;
  const campaign = formData.get("campaign") as string;
  const term = formData.get("term") as string;
  const content = formData.get("content") as string;

  await db.insert(utmTemplates).values({
    workspaceId,
    name,
    source,
    medium,
    campaign,
    term,
    content,
  });

  revalidatePath(`/app/${workspaceId}/settings`);
  revalidatePath(`/app/${workspaceId}/templates`);
};

export const getUtmTemplates = async (
  workspaceId: string,
  page: number = 1,
  limit: number = 12
) => {
  const { userId } = await auth();
  if (!userId) {
    return {
      templates: [],
      totalCount: 0,
      totalPages: 0,
    };
  }

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, userId))) {
    return {
      templates: [],
      totalCount: 0,
      totalPages: 0,
    };
  }

  const offset = (page - 1) * limit;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(utmTemplates)
    .where(eq(utmTemplates.workspaceId, workspaceId));

  const totalCount = Number(count);
  const totalPages = Math.ceil(totalCount / limit);

  // Get paginated templates
  const templates = await db
    .select()
    .from(utmTemplates)
    .where(eq(utmTemplates.workspaceId, workspaceId))
    .orderBy(desc(utmTemplates.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    templates,
    totalCount,
    totalPages,
  };
};

export const deleteUtmTemplate = async (templateId: string, workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, user.id))) {
    throw new Error("You don't have access to this workspace");
  }

  // Verify template belongs to workspace
  const [template] = await db
    .select()
    .from(utmTemplates)
    .where(and(eq(utmTemplates.id, templateId), eq(utmTemplates.workspaceId, workspaceId)))
    .limit(1);

  if (!template) {
    throw new Error("Template not found");
  }

  await db.delete(utmTemplates).where(eq(utmTemplates.id, templateId));

  revalidatePath(`/app/${workspaceId}/settings`);
  revalidatePath(`/app/${workspaceId}/templates`);
};
