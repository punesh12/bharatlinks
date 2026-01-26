"use server";

import { db } from "@/db";
import { utmTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createUtmTemplate = async (formData: FormData, workspaceId: string) => {
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
  return await db.select().from(utmTemplates).where(eq(utmTemplates.workspaceId, workspaceId));
};
