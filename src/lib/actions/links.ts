"use server";

import { db } from "@/db";
import { links, geoRules } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc, asc, count, and, or, like } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export const createLink = async (workspaceId: string, formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  if (!workspaceId) {
    console.error("Error: workspaceId is missing in createLink");
    throw new Error("Workspace ID is required");
  }

  const longUrl = formData.get("longUrl") as string;
  const shortCode = (formData.get("shortCode") as string) || nanoid(6);

  // UTM params
  const utmSource = formData.get("utm_source") as string;
  const utmMedium = formData.get("utm_medium") as string;
  const utmCampaign = formData.get("utm_campaign") as string;

  // Construct final URL with UTMs if present
  let finalUrl = longUrl;
  if (utmSource || utmMedium || utmCampaign) {
    try {
      const urlObj = new URL(longUrl);
      if (utmSource) urlObj.searchParams.set("utm_source", utmSource);
      if (utmMedium) urlObj.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) urlObj.searchParams.set("utm_campaign", utmCampaign);
      finalUrl = urlObj.toString();
    } catch {
      finalUrl = longUrl;
    }
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;

  // UPI Fields
  const type = (formData.get("type") as "standard" | "upi") || "standard";
  const upiVpa = formData.get("upiVpa") as string;
  const upiName = formData.get("upiName") as string;
  const upiAmount = formData.get("upiAmount") as string;
  const upiNote = formData.get("upiNote") as string;

  // Tags - store as comma-separated string
  const tagsInput = formData.get("tags") as string;
  const tagsString = tagsInput
    ? tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .join(",")
    : null;

  await db.insert(links).values({
    workspaceId,
    longUrl: finalUrl,
    shortCode,
    title,
    description,
    imageUrl,
    tags: tagsString,
    type,
    upiVpa,
    upiName,
    upiAmount,
    upiNote,
  });

  revalidatePath(`/app/${workspaceId}`);
  revalidatePath(`/app/${workspaceId}/links`);

  return { success: true, shortCode };
};

export const updateLink = async (linkId: string, workspaceId: string, formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const longUrl = formData.get("longUrl") as string;
  const tagsInput = formData.get("tags") as string;
  const tagsString = tagsInput
    ? tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .join(",")
    : null;

  await db
    .update(links)
    .set({ title, description, imageUrl, longUrl, tags: tagsString })
    .where(eq(links.id, linkId));

  revalidatePath(`/app/${workspaceId}`);
  revalidatePath(`/app/${workspaceId}/links`);

  return { success: true };
};

export const deleteLink = async (linkId: string, workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Delete geo rules first (if any)
  await db.delete(geoRules).where(eq(geoRules.linkId, linkId));

  // Delete the link
  await db.delete(links).where(eq(links.id, linkId));

  revalidatePath(`/app/${workspaceId}`);
  revalidatePath(`/app/${workspaceId}/links`);

  return { success: true };
};

export const addGeoRule = async (
  linkId: string,
  stateName: string,
  targetUrl: string,
  workspaceId: string
) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db.insert(geoRules).values({
    linkId,
    stateName,
    targetUrl,
  });

  revalidatePath(`/app/${workspaceId}/links`);
  return { success: true };
};

export const deleteGeoRule = async (ruleId: string, workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(geoRules).where(eq(geoRules.id, ruleId));

  revalidatePath(`/app/${workspaceId}/links`);
  return { success: true };
};

export const getGeoRules = async (linkId: string) => {
  return await db.select().from(geoRules).where(eq(geoRules.linkId, linkId));
};

export const getLinks = async (
  workspaceId: string,
  page: number = 1,
  limit: number = 12,
  options?: {
    search?: string;
    sortBy?: "createdAt" | "clickCount" | "title";
    sortOrder?: "asc" | "desc";
    tagFilter?: string[]; // Array of tag names to filter by
  }
) => {
  const offset = (page - 1) * limit;
  const { search, sortBy = "createdAt", sortOrder = "desc", 
    // tagFilter = []
   } = options || {};

  // Build where conditions
  const conditions = [eq(links.workspaceId, workspaceId)];

  // Search filter
  if (search) {
    conditions.push(
      or(
        like(links.title, `%${search}%`),
        like(links.shortCode, `%${search}%`),
        like(links.longUrl, `%${search}%`),
        like(links.description, `%${search}%`)
        // Note: tags search will be added after migration runs
        // like(links.tags, `%${search}%`)
      )!
    );
  }

  // Tag filter - filter by tag names in the tags column
  // Note: This requires the tags column to exist (run migration first)
  // Temporarily disabled until migration is run
  // if (tagFilter.length > 0) {
  //     const tagConditions = tagFilter.map(tagName =>
  //         like(links.tags, `%${tagName.toLowerCase()}%`)
  //     );
  //     conditions.push(or(...tagConditions)!);
  // }

  // Get total count for pagination
  const countResult = await db
    .select({ count: count() })
    .from(links)
    .where(and(...conditions));

  const totalCount = Number(countResult[0]?.count || 0);

  // Build order by
  const orderBy =
    sortBy === "clickCount"
      ? sortOrder === "asc"
        ? asc(links.clickCount)
        : desc(links.clickCount)
      : sortBy === "title"
        ? sortOrder === "asc"
          ? asc(links.title)
          : desc(links.title)
        : sortOrder === "asc"
          ? asc(links.createdAt)
          : desc(links.createdAt);

  // Get paginated data
  // Explicitly select columns to handle missing tags column gracefully
  let data;
  try {
    data = await db
      .select({
        id: links.id,
        workspaceId: links.workspaceId,
        shortCode: links.shortCode,
        longUrl: links.longUrl,
        clickCount: links.clickCount,
        title: links.title,
        description: links.description,
        imageUrl: links.imageUrl,
        tags: links.tags,
        type: links.type,
        upiVpa: links.upiVpa,
        upiName: links.upiName,
        upiAmount: links.upiAmount,
        upiNote: links.upiNote,
        createdAt: links.createdAt,
      })
      .from(links)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
  } catch (error: unknown) {
    // If tags column doesn't exist, select without it
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('column "tags"') || errorMessage.includes("does not exist")) {
      data = await db
        .select({
          id: links.id,
          workspaceId: links.workspaceId,
          shortCode: links.shortCode,
          longUrl: links.longUrl,
          clickCount: links.clickCount,
          title: links.title,
          description: links.description,
          imageUrl: links.imageUrl,
          type: links.type,
          upiVpa: links.upiVpa,
          upiName: links.upiName,
          upiAmount: links.upiAmount,
          upiNote: links.upiNote,
          createdAt: links.createdAt,
        })
        .from(links)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);
      // Add null tags to each link
      data = data.map((link) => ({ ...link, tags: null }));
    } else {
      throw error;
    }
  }

  // Parse tags from comma-separated string
  const linksWithTags = data.map((link) => ({
    ...link,
    tags: link.tags
      ? link.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((name, index) => ({
            id: `${link.id}-${index}`,
            name: name,
          }))
      : [],
  }));

  return {
    links: linksWithTags,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

export const getAllTags = async (workspaceId: string) => {
  try {
    // Get all links in workspace and extract unique tags
    // Note: This requires the tags column to exist (run migration first)
    let allLinks;
    try {
      allLinks = await db
        .select({ tags: links.tags })
        .from(links)
        .where(eq(links.workspaceId, workspaceId));
    } catch (error: unknown) {
      // If tags column doesn't exist yet, return empty array
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('column "tags"') || errorMessage.includes("does not exist")) {
        return [];
      }
      throw error;
    }

    // Extract all unique tags
    const tagSet = new Set<string>();
    allLinks.forEach((link) => {
      if (link.tags) {
        link.tags.split(",").forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            tagSet.add(trimmed);
          }
        });
      }
    });

    // Convert to array with IDs
    return Array.from(tagSet)
      .sort()
      .map((name, index) => ({
        id: `tag-${index}`,
        name: name,
      }));
  } catch (error) {
    console.warn("Failed to fetch tags:", error);
    return [];
  }
};
