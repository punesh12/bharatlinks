"use server";

import { db } from "@/db";
import { users, links } from "@/db/schema";
import { eq, and, gte, count, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { getPlan, type PlanTier, getLimit, isUnlimited } from "@/lib/plans";

/**
 * Get user's current plan tier
 */
export const getUserPlan = async (): Promise<PlanTier> => {
  const user = await currentUser();
  if (!user) return "free";

  const [userRecord] = await db.select().from(users).where(eq(users.id, user.id));

  if (!userRecord) {
    // Create user record if doesn't exist
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        planTier: "free",
      })
      .onConflictDoNothing();
    return "free";
  }

  return (userRecord.planTier as PlanTier) || "free";
};

/**
 * Get monthly link count for a workspace
 */
export const getMonthlyLinkCount = async (workspaceId: string): Promise<number> => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: count() })
    .from(links)
    .where(
      and(
        eq(links.workspaceId, workspaceId),
        gte(links.createdAt, startOfMonth)
      )
    );

  return result?.count || 0;
};

/**
 * Check if user can create more links this month
 */
export const canCreateLink = async (workspaceId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
}> => {
  const user = await currentUser();
  if (!user) {
    return { allowed: false, reason: "Unauthorized" };
  }

  const planTier = await getUserPlan();
  const plan = getPlan(planTier);

  // Check if unlimited
  if (isUnlimited(planTier, "monthlyLinks")) {
    return { allowed: true };
  }

  const limit = getLimit(planTier, "monthlyLinks");
  if (limit === null) {
    return { allowed: true };
  }

  const currentCount = await getMonthlyLinkCount(workspaceId);

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limit} links. Upgrade to create more.`,
      currentCount,
      limit,
    };
  }

  return {
    allowed: true,
    currentCount,
    limit,
  };
};

/**
 * Check if user has access to a feature
 */
export const hasFeatureAccess = async (
  feature: "customDomains" | "deepLinking" | "advancedAnalytics" | "dataExport" | "apiAccess" | "whatsappCustomization" | "qrCustomization"
): Promise<boolean> => {
  const planTier = await getUserPlan();
  return getPlan(planTier).limits[feature] === true;
};

/**
 * Get remaining links for the month
 */
export const getRemainingLinks = async (workspaceId: string): Promise<{
  remaining: number | null;
  used: number;
  limit: number | null;
}> => {
  const planTier = await getUserPlan();
  const limit = getLimit(planTier, "monthlyLinks");
  const used = await getMonthlyLinkCount(workspaceId);

  if (limit === null) {
    return { remaining: null, used, limit: null };
  }

  return {
    remaining: Math.max(0, limit - used),
    used,
    limit,
  };
};
