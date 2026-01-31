"use server";

import { db } from "@/db";
import { users, links, workspaceMembers, workspaceInvitations, activityLogs } from "@/db/schema";
import { eq, and, gte, count, inArray } from "drizzle-orm";
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
 * Get all workspace IDs for the current user
 */
const getUserWorkspaceIds = async (): Promise<string[]> => {
  const user = await currentUser();
  if (!user) return [];

  const userWorkspaces = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id));

  return userWorkspaces.map((w) => w.workspaceId);
};

/**
 * Get monthly link count for links created by the current user
 * This counts links the user actually created, not all links in workspaces they're a member of
 */
export const getMonthlyLinkCount = async (workspaceId?: string): Promise<number> => {
  const user = await currentUser();
  if (!user) return 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count links created by the current user using activity logs
  // This ensures we only count links the user actually created, not all links in workspaces they joined
  if (workspaceId) {
    // Count links created by user in the specific workspace
    const [result] = await db
      .select({ count: count() })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.userId, user.id),
          eq(activityLogs.workspaceId, workspaceId),
          eq(activityLogs.action, "link.created"),
          gte(activityLogs.createdAt, startOfMonth)
        )
      );

    return result?.count || 0;
  }

  // Count links created by user across all workspaces they're a member of
  const userWorkspaceIds = await getUserWorkspaceIds();
  if (userWorkspaceIds.length === 0) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, user.id),
        inArray(activityLogs.workspaceId, userWorkspaceIds),
        eq(activityLogs.action, "link.created"),
        gte(activityLogs.createdAt, startOfMonth)
      )
    );

  return result?.count || 0;
};

/**
 * Check if user can create more links this month
 * Note: workspaceId parameter is kept for backward compatibility but usage is now aggregated across all user workspaces
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const canCreateLink = async (
  _workspaceId: string
): Promise<{
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

  // Check if unlimited
  if (isUnlimited(planTier, "monthlyLinks")) {
    return { allowed: true };
  }

  const limit = getLimit(planTier, "monthlyLinks");
  if (limit === null) {
    return { allowed: true };
  }

  // Count links across all user workspaces, not just the current workspace
  const currentCount = await getMonthlyLinkCount();

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limit} links across all workspaces. Upgrade to create more.`,
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
 * Get current workspace count for the user
 */
/**
 * Get count of workspaces where user is OWNER (not member)
 * Users can be members of unlimited workspaces, but can only own limited workspaces
 */
export const getUserWorkspaceCount = async (): Promise<number> => {
  const user = await currentUser();
  if (!user) return 0;

  const userWorkspaces = await db
    .select({ count: count() })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.userId, user.id), eq(workspaceMembers.role, "owner")));

  return userWorkspaces[0]?.count || 0;
};

/**
 * Check if user can create more workspaces
 */
export const canCreateWorkspace = async (): Promise<{
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
  const limit = getLimit(planTier, "workspaces");

  // Check if unlimited
  if (limit === null) {
    return { allowed: true };
  }

  const currentCount = await getUserWorkspaceCount();

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your workspace limit of ${limit}. Upgrade to create more workspaces.`,
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
  feature:
    | "customDomains"
    | "deepLinking"
    | "advancedAnalytics"
    | "dataExport"
    | "apiAccess"
    | "whatsappCustomization"
    | "qrCustomization"
): Promise<boolean> => {
  const planTier = await getUserPlan();
  return getPlan(planTier).limits[feature] === true;
};

/**
 * Check if user can add more team members to a workspace
 */
export const canAddTeamMember = async (
  workspaceId: string
): Promise<{
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
  const limit = getLimit(planTier, "teamMembers");

  // Check if unlimited
  if (limit === null) {
    return { allowed: true };
  }

  try {
    // Count current members and pending invitations
    const [currentMembers, pendingInvitations] = await Promise.all([
      db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId)),
      db
        .select()
        .from(workspaceInvitations)
        .where(
          and(
            eq(workspaceInvitations.workspaceId, workspaceId),
            eq(workspaceInvitations.status, "pending")
          )
        ),
    ]);

    const totalCount = currentMembers.length + pendingInvitations.length;

    if (totalCount >= limit) {
      return {
        allowed: false,
        reason: `Team member limit reached (${limit} members). Upgrade to add more members.`,
        currentCount: totalCount,
        limit,
      };
    }

    return {
      allowed: true,
      currentCount: totalCount,
      limit,
    };
  } catch (error) {
    // If tables don't exist yet (migration not run), allow adding members
    // This prevents 500 errors during development
    console.error("Error checking team member limits (tables may not exist):", error);
    return {
      allowed: true,
      currentCount: 0,
      limit,
    };
  }
};

/**
 * Get remaining links for the month (across all user workspaces)
 * Note: workspaceId parameter is kept for backward compatibility but usage is now aggregated across all user workspaces
 */
export const getRemainingLinks = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _workspaceId?: string
): Promise<{
  remaining: number | null;
  used: number;
  limit: number | null;
}> => {
  const planTier = await getUserPlan();
  const limit = getLimit(planTier, "monthlyLinks");
  // Count links across all user workspaces, not just the current workspace
  const used = await getMonthlyLinkCount();

  if (limit === null) {
    return { remaining: null, used, limit: null };
  }

  return {
    remaining: Math.max(0, limit - used),
    used,
    limit,
  };
};
