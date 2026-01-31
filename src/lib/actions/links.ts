"use server";

import { db } from "@/db";
import { links, geoRules, analytics, activityLogs, workspaceMembers } from "@/db/schema";
import { currentUser, auth } from "@clerk/nextjs/server";
import { eq, desc, asc, count, and, or, like, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { UAParser } from "ua-parser-js";
import { canCreateLink } from "@/lib/utils/plans";

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

/**
 * Validates and normalizes a URL
 * @param url - The URL to validate
 * @returns Normalized URL or throws an error if invalid
 */
const validateAndNormalizeUrl = (url: string): string => {
  if (!url || typeof url !== "string") {
    throw new Error("URL is required");
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    throw new Error("URL cannot be empty");
  }

  // Try to parse as-is first
  try {
    const urlObj = new URL(trimmedUrl);
    // Ensure it's http or https
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      throw new Error("URL must use http:// or https:// protocol");
    }
    return urlObj.toString();
  } catch {
    // If parsing fails, try adding https://
    try {
      const urlWithProtocol = `https://${trimmedUrl}`;
      const urlObj = new URL(urlWithProtocol);
      // Validate it's a valid domain format
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        throw new Error("Invalid URL format");
      }
      // Check for basic domain pattern (at least one dot or localhost)
      if (
        !urlObj.hostname.includes(".") &&
        urlObj.hostname !== "localhost" &&
        !urlObj.hostname.match(/^\[.*\]$/) // IPv6
      ) {
        throw new Error("Invalid domain format");
      }
      return urlObj.toString();
    } catch {
      throw new Error(
        `Invalid URL format. Please enter a valid URL (e.g., https://example.com or example.com)`
      );
    }
  }
};

export const createLink = async (workspaceId: string, formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  if (!workspaceId) {
    console.error("Error: workspaceId is missing in createLink");
    throw new Error("Workspace ID is required");
  }

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, user.id))) {
    throw new Error("You don't have access to this workspace");
  }

  // Check plan limits
  const limitCheck = await canCreateLink(workspaceId);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason || "Plan limit reached");
  }

  const longUrl = formData.get("longUrl") as string;
  const shortCode = (formData.get("shortCode") as string) || nanoid(6);

  // UPI Fields - check type first to skip URL validation for UPI links
  const type = (formData.get("type") as "standard" | "upi") || "standard";
  const upiVpa = formData.get("upiVpa") as string;
  const upiName = formData.get("upiName") as string;
  const upiAmount = formData.get("upiAmount") as string;
  const upiNote = formData.get("upiNote") as string;

  // Validate UPI link has required VPA
  if (type === "upi" && (!upiVpa || upiVpa.trim().length === 0)) {
    throw new Error("UPI ID (VPA) is required for UPI Express links");
  }

  // Validate and normalize URL (skip for UPI links as they use placeholder URL)
  let normalizedUrl: string;
  let finalUrl: string;

  if (type === "upi") {
    // For UPI links, use the placeholder URL as-is
    finalUrl = longUrl || "https://bharatlinks.in/upi-redirect";
  } else {
    // Validate and normalize standard URLs
    try {
      normalizedUrl = validateAndNormalizeUrl(longUrl);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Invalid URL");
    }

    // UTM params
    const utmSource = formData.get("utm_source") as string;
    const utmMedium = formData.get("utm_medium") as string;
    const utmCampaign = formData.get("utm_campaign") as string;

    // Construct final URL with UTMs if present
    finalUrl = normalizedUrl;
    if (utmSource || utmMedium || utmCampaign) {
      try {
        const urlObj = new URL(normalizedUrl);
        if (utmSource) urlObj.searchParams.set("utm_source", utmSource);
        if (utmMedium) urlObj.searchParams.set("utm_medium", utmMedium);
        if (utmCampaign) urlObj.searchParams.set("utm_campaign", utmCampaign);
        finalUrl = urlObj.toString();
      } catch {
        // If UTM addition fails, use normalized URL without UTMs
        finalUrl = normalizedUrl;
      }
    }
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;

  // Tags - store as comma-separated string
  const tagsInput = formData.get("tags") as string;
  const tagsString = tagsInput
    ? tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .join(",")
    : null;

  const [newLink] = await db
    .insert(links)
    .values({
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
    })
    .returning();

  // Log activity
  const { userId } = await auth();
  if (userId && newLink) {
    await db.insert(activityLogs).values({
      workspaceId,
      userId,
      action: "link.created",
      entityType: "link",
      entityId: newLink.id,
      metadata: JSON.stringify({ shortCode, type }),
    });
  }

  revalidatePath(`/app/${workspaceId}`);
  revalidatePath(`/app/${workspaceId}/links`);

  return { success: true, shortCode };
};

export const updateLink = async (linkId: string, workspaceId: string, formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, user.id))) {
    throw new Error("You don't have access to this workspace");
  }

  // Verify the link belongs to this workspace
  const [link] = await db
    .select({ workspaceId: links.workspaceId })
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);

  if (!link || link.workspaceId !== workspaceId) {
    throw new Error("Link not found or access denied");
  }

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

  // Validate and normalize URL
  let normalizedUrl: string;
  try {
    normalizedUrl = validateAndNormalizeUrl(longUrl);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid URL");
  }

  const [updatedLink] = await db
    .update(links)
    .set({ title, description, imageUrl, longUrl: normalizedUrl, tags: tagsString })
    .where(eq(links.id, linkId))
    .returning();

  // Log activity
  const { userId } = await auth();
  if (userId && updatedLink) {
    await db.insert(activityLogs).values({
      workspaceId,
      userId,
      action: "link.updated",
      entityType: "link",
      entityId: linkId,
      metadata: JSON.stringify({ shortCode: updatedLink.shortCode }),
    });
  }

  revalidatePath(`/app/${workspaceId}`);
  revalidatePath(`/app/${workspaceId}/links`);

  return { success: true };
};

export const deleteLink = async (linkId: string, workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, user.id))) {
    throw new Error("You don't have access to this workspace");
  }

  // Verify the link belongs to this workspace
  const [link] = await db
    .select({ workspaceId: links.workspaceId })
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);

  if (!link || link.workspaceId !== workspaceId) {
    throw new Error("Link not found or access denied");
  }

  // Get link info before deletion for logging
  const [linkToDelete] = await db
    .select({ shortCode: links.shortCode })
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);

  // Delete geo rules first (if any)
  await db.delete(geoRules).where(eq(geoRules.linkId, linkId));

  // Delete the link
  await db.delete(links).where(eq(links.id, linkId));

  // Log activity
  const { userId } = await auth();
  if (userId && linkToDelete) {
    await db.insert(activityLogs).values({
      workspaceId,
      userId,
      action: "link.deleted",
      entityType: "link",
      entityId: linkId,
      metadata: JSON.stringify({ shortCode: linkToDelete.shortCode }),
    });
  }

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

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, user.id))) {
    throw new Error("You don't have access to this workspace");
  }

  // Verify the link belongs to this workspace
  const [link] = await db
    .select({ workspaceId: links.workspaceId })
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);

  if (!link || link.workspaceId !== workspaceId) {
    throw new Error("Link not found or access denied");
  }

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

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, user.id))) {
    throw new Error("You don't have access to this workspace");
  }

  // Verify the geo rule's link belongs to this workspace
  const [geoRule] = await db
    .select({ linkId: geoRules.linkId })
    .from(geoRules)
    .where(eq(geoRules.id, ruleId))
    .limit(1);

  if (geoRule) {
    const [link] = await db
      .select({ workspaceId: links.workspaceId })
      .from(links)
      .where(eq(links.id, geoRule.linkId))
      .limit(1);

    if (!link || link.workspaceId !== workspaceId) {
      throw new Error("Geo rule not found or access denied");
    }
  }

  await db.delete(geoRules).where(eq(geoRules.id, ruleId));

  revalidatePath(`/app/${workspaceId}/links`);
  return { success: true };
};

export const getGeoRules = async (linkId: string, workspaceId: string) => {
  const { userId } = await auth();
  if (!userId) return [];

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, userId))) {
    return [];
  }

  // Verify the link belongs to this workspace
  const [link] = await db
    .select({ workspaceId: links.workspaceId })
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);

  if (!link || link.workspaceId !== workspaceId) {
    return [];
  }

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
  const { userId } = await auth();
  if (!userId) return { links: [], total: 0, totalPages: 0 };

  // Check if user is a member of the workspace
  if (!(await isWorkspaceMember(workspaceId, userId))) {
    return { links: [], total: 0, totalPages: 0 };
  }
  const offset = (page - 1) * limit;
  const { search, sortBy = "createdAt", sortOrder = "desc" } = options || {};

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

export const trackLinkClick = async (
  linkId: string,
  requestHeaders: {
    userAgent?: string | null;
    referer?: string | null;
    forwardedFor?: string | null;
    realIp?: string | null;
  }
) => {
  try {
    const { userAgent = "", referer, forwardedFor, realIp } = requestHeaders;

    // Get IP address
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "Unknown";

    // Parse user agent
    const parser = new UAParser(userAgent || "");
    const uaResult = parser.getResult();

    // Extract device, OS, and browser info
    const deviceType = uaResult.device.type || "desktop";
    const device =
      deviceType === "mobile" ? "mobile" : deviceType === "tablet" ? "tablet" : "desktop";
    const os = uaResult.os.name || "Unknown";
    const browser = uaResult.browser.name || "Unknown";

    // Get referrer
    const referrer = referer && referer !== "Direct" ? referer : null;

    // Create analytics record
    await db.insert(analytics).values({
      linkId,
      ip,
      device,
      os,
      browser,
      referrer,
      userAgent: userAgent || null,
      // Note: Country, city, region, continent would require IP geolocation service
      // For now, leaving them as null
      country: null,
      city: null,
      region: null,
      continent: null,
    });

    // Increment click count
    await db
      .update(links)
      .set({
        clickCount: sql`${links.clickCount} + 1`,
      })
      .where(eq(links.id, linkId));
  } catch (error) {
    console.error("Failed to track link click:", error);
    // Don't throw - we don't want to block the redirect if analytics fails
  }
};
