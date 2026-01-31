"use server";

import { db } from "@/db";
import {
  users,
  workspaceMembers,
  workspaces,
  workspaceInvitations,
  activityLogs,
  links,
  geoRules,
  analytics,
  utmTemplates,
} from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserPlan } from "@/lib/utils/plans";
import { getLimit, getUpgradeSuggestion, PLANS } from "@/lib/plans";
import { randomBytes } from "crypto";
import { sendInvitationEmail } from "@/lib/services/email";

/**
 * Check if user has permission to manage team members
 */
const canManageTeam = async (workspaceId: string): Promise<boolean> => {
  const { userId } = await auth();
  if (!userId) return false;

  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  return member?.role === "owner";
};

/**
 * Log activity for a workspace
 */
const logActivity = async (
  workspaceId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) => {
  const { userId } = await auth();
  if (!userId) return;

  try {
    await db.insert(activityLogs).values({
      workspaceId,
      userId,
      action,
      entityType,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    // Silently fail if activity logs table doesn't exist yet
    console.error("Failed to log activity:", error);
  }
};

/**
 * Invite a team member to a workspace
 */
export const inviteTeamMember = async (
  workspaceId: string,
  email: string,
  role: "owner" | "member" = "member"
) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions
  if (!(await canManageTeam(workspaceId))) {
    throw new Error("Only workspace owners can invite members");
  }

  // Check team member limit (including pending invitations)
  const planTier = await getUserPlan();
  const limit = getLimit(planTier, "teamMembers");
  if (limit !== null) {
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
      const upgradeSuggestion = getUpgradeSuggestion(planTier, "team");
      const upgradeMessage = upgradeSuggestion
        ? ` Upgrade to ${PLANS[upgradeSuggestion].name} plan to add more members.`
        : "";
      throw new Error(`Team member limit reached (${limit} members).${upgradeMessage}`);
    }
  }

  // Check if user is already a member
  const existingMember = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingMember.length > 0) {
    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, existingMember[0].id)
        )
      )
      .limit(1);

    if (member) {
      throw new Error("User is already a member of this workspace");
    }
  }

  // Check for existing pending invitation
  const existingInvite = await db
    .select()
    .from(workspaceInvitations)
    .where(
      and(
        eq(workspaceInvitations.workspaceId, workspaceId),
        eq(workspaceInvitations.email, email),
        eq(workspaceInvitations.status, "pending")
      )
    )
    .limit(1);

  if (existingInvite.length > 0) {
    throw new Error("Invitation already sent to this email");
  }

  // Create invitation
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  await db.insert(workspaceInvitations).values({
    workspaceId,
    email,
    role,
    invitedBy: user.id,
    token,
    expiresAt,
  });

  // Get workspace name for email
  const [workspace] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  // Get inviter name
  const [inviter] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  // Send invitation email (non-blocking)
  sendInvitationEmail({
    email,
    workspaceName: workspace?.name || "Workspace",
    inviterName: inviter?.email || user.emailAddresses[0].emailAddress,
    invitationLink: token,
    expiresAt,
  }).catch((error) => {
    // Log error but don't fail the invitation creation
    // Email sending failures should not prevent invitation creation
    console.error("Failed to send invitation email (invitation still created):", error);
  });

  // Log activity
  await logActivity(workspaceId, "member.invited", "member", undefined, {
    email,
    role,
  });

  revalidatePath(`/app/${workspaceId}`);
  return { success: true, token };
};

/**
 * Accept a workspace invitation
 */
export const acceptInvitation = async (token: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Find invitation
  const [invitation] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.token, token))
    .limit(1);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Check if user is already a member (even if invitation is not pending)
  const [existingMember] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, invitation.workspaceId),
        eq(workspaceMembers.userId, user.id)
      )
    )
    .limit(1);

  if (existingMember) {
    // User is already a member, mark invitation as accepted if not already
    if (invitation.status === "pending") {
      await db
        .update(workspaceInvitations)
        .set({ status: "accepted" })
        .where(eq(workspaceInvitations.id, invitation.id));
    }
    // Return success - user is already in the workspace
    return { success: true, workspaceId: invitation.workspaceId };
  }

  if (invitation.status !== "pending") {
    // If invitation was already processed but user is not a member, provide helpful error
    if (invitation.status === "accepted") {
      throw new Error(
        "This invitation was already accepted. If you believe this is an error, please contact the workspace owner."
      );
    }
    if (invitation.status === "expired") {
      throw new Error(
        "This invitation has expired. Please request a new invitation from the workspace owner."
      );
    }
    throw new Error("Invitation has already been processed");
  }

  if (new Date() > invitation.expiresAt) {
    // Mark as expired
    await db
      .update(workspaceInvitations)
      .set({ status: "expired" })
      .where(eq(workspaceInvitations.id, invitation.id));
    throw new Error("Invitation has expired");
  }

  // Note: No team member limit check here - users can join unlimited workspaces as members
  // The limit only applies when:
  // 1. Creating workspaces (as owner) - checked in createWorkspace
  // 2. Inviting team members (workspace owner's limit) - checked in inviteTeamMember

  // Check if the signed-in user's email matches the invitation email (case-insensitive)
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
  const invitationEmail = invitation.email.toLowerCase().trim();

  if (!userEmail || userEmail !== invitationEmail) {
    throw new Error(
      `This invitation was sent to ${invitation.email}, but you are signed in as ${user.emailAddresses[0]?.emailAddress || "unknown"}. Please sign in with the correct email address.`
    );
  }

  // Ensure user exists in database (create if doesn't exist)
  try {
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
      })
      .onConflictDoNothing();

    // Verify user was created/exists
    const [userRecord] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    if (!userRecord) {
      throw new Error("Failed to create user record. Please try again.");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error ensuring user exists:", errorMessage, error);

    // If it's not a conflict error, re-throw
    if (!errorMessage.includes("duplicate") && !errorMessage.includes("already exists")) {
      throw new Error(`Failed to create user account: ${errorMessage}`);
    }
  }

  // Check if user is already a member of this workspace (second check after user creation)
  const [existingMemberCheck] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, invitation.workspaceId),
        eq(workspaceMembers.userId, user.id)
      )
    )
    .limit(1);

  if (existingMemberCheck) {
    // User is already a member, just mark invitation as accepted
    await db
      .update(workspaceInvitations)
      .set({ status: "accepted" })
      .where(eq(workspaceInvitations.id, invitation.id));

    return { success: true, workspaceId: invitation.workspaceId };
  }

  // Add user to workspace
  try {
    await db.insert(workspaceMembers).values({
      workspaceId: invitation.workspaceId,
      userId: user.id,
      role: invitation.role,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // If there's a conflict, user might already be a member
    if (errorMessage.includes("duplicate") || errorMessage.includes("23505")) {
      // User is already a member, just mark invitation as accepted
      await db
        .update(workspaceInvitations)
        .set({ status: "accepted" })
        .where(eq(workspaceInvitations.id, invitation.id));

      return { success: true, workspaceId: invitation.workspaceId };
    }

    console.error("Error adding user to workspace:", errorMessage, error);
    throw new Error(`Failed to add you to the workspace: ${errorMessage}`);
  }

  // Update invitation status
  await db
    .update(workspaceInvitations)
    .set({ status: "accepted" })
    .where(eq(workspaceInvitations.id, invitation.id));

  // Log activity
  await logActivity(invitation.workspaceId, "member.joined", "member", user.id, {
    email: invitation.email,
  });

  revalidatePath("/app");
  return { success: true, workspaceId: invitation.workspaceId };
};

/**
 * Reject a workspace invitation
 */
export const rejectInvitation = async (token: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [invitation] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.token, token))
    .limit(1);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.email !== user.emailAddresses[0].emailAddress) {
    throw new Error("This invitation is not for your email");
  }

  await db
    .update(workspaceInvitations)
    .set({ status: "rejected" })
    .where(eq(workspaceInvitations.id, invitation.id));

  revalidatePath("/app");
  return { success: true };
};

/**
 * Cancel a pending invitation
 */
export const cancelInvitation = async (invitationId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [invitation] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.id, invitationId))
    .limit(1);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Check permissions
  if (!(await canManageTeam(invitation.workspaceId))) {
    throw new Error("Only workspace owners can cancel invitations");
  }

  if (invitation.status !== "pending") {
    throw new Error("Can only cancel pending invitations");
  }

  await db
    .update(workspaceInvitations)
    .set({ status: "expired" })
    .where(eq(workspaceInvitations.id, invitationId));

  // Log activity
  await logActivity(invitation.workspaceId, "member.invitation_cancelled", "member", undefined, {
    email: invitation.email,
  });

  revalidatePath(`/app/${invitation.workspaceId}`);
  return { success: true };
};

/**
 * Change a team member's role
 */
export const changeMemberRole = async (
  workspaceId: string,
  userId: string,
  newRole: "owner" | "member"
) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions
  if (!(await canManageTeam(workspaceId))) {
    throw new Error("Only workspace owners can change roles");
  }

  // Get current member
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  if (!member) {
    throw new Error("Member not found");
  }

  const oldRole = member.role;

  // Prevent changing the last owner's role
  if (oldRole === "owner" && newRole === "member") {
    const owners = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, "owner"))
      );

    if (owners.length === 1) {
      throw new Error("Cannot remove the last owner from the workspace");
    }
  }

  await db
    .update(workspaceMembers)
    .set({ role: newRole })
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));

  // Log activity
  await logActivity(workspaceId, "role.changed", "member", userId, {
    oldRole,
    newRole,
  });

  revalidatePath(`/app/${workspaceId}`);
  return { success: true };
};

/**
 * Remove a team member from a workspace
 */
export const removeTeamMember = async (workspaceId: string, userId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions
  if (!(await canManageTeam(workspaceId))) {
    throw new Error("Only workspace owners can remove members");
  }

  // Prevent removing yourself
  if (userId === user.id) {
    throw new Error("You cannot remove yourself from the workspace");
  }

  // Get member to remove
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  if (!member) {
    throw new Error("Member not found");
  }

  // Prevent removing the last owner
  if (member.role === "owner") {
    const owners = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, "owner"))
      );

    if (owners.length === 1) {
      throw new Error("Cannot remove the last owner from the workspace");
    }
  }

  await db
    .delete(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));

  // Log activity
  await logActivity(workspaceId, "member.removed", "member", userId, {});

  revalidatePath(`/app/${workspaceId}`);
  return { success: true };
};

/**
 * Get all team members for a workspace
 */
export const getTeamMembers = async (workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is a member
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, user.id)))
    .limit(1);

  if (!member) {
    throw new Error("You don't have access to this workspace");
  }

  const members = await db
    .select({
      userId: workspaceMembers.userId,
      email: users.email,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  return members;
};

/**
 * Get all pending invitations for a workspace
 */
export const getPendingInvitations = async (workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions (only owners can see pending invitations)
  if (!(await canManageTeam(workspaceId))) {
    return [];
  }

  const invitations = await db
    .select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      invitedBy: workspaceInvitations.invitedBy,
      createdAt: workspaceInvitations.createdAt,
      expiresAt: workspaceInvitations.expiresAt,
    })
    .from(workspaceInvitations)
    .where(
      and(
        eq(workspaceInvitations.workspaceId, workspaceId),
        eq(workspaceInvitations.status, "pending")
      )
    )
    .orderBy(desc(workspaceInvitations.createdAt));

  return invitations;
};

/**
 * Leave a workspace (for members and owners who are not the last owner)
 */
export const leaveWorkspace = async (workspaceId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is a member
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, user.id)))
    .limit(1);

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  // Prevent leaving if you're the last owner
  if (member.role === "owner") {
    const owners = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, "owner"))
      );

    if (owners.length === 1) {
      throw new Error(
        "You cannot leave the workspace as you are the last owner. Please transfer ownership or delete the workspace."
      );
    }
  }

  // Remove user from workspace
  await db
    .delete(workspaceMembers)
    .where(
      and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, user.id))
    );

  // Log activity
  await logActivity(workspaceId, "member.left", "member", user.id, {});

  revalidatePath("/app");
  return { success: true };
};

/**
 * Get activity logs for a workspace
 */
export const getActivityLogs = async (workspaceId: string, limit: number = 50) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is a member
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, user.id)))
    .limit(1);

  if (!member) {
    throw new Error("You don't have access to this workspace");
  }

  try {
    const logs = await db
      .select({
        id: activityLogs.id,
        userId: activityLogs.userId,
        userEmail: users.email,
        action: activityLogs.action,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .innerJoin(users, eq(users.id, activityLogs.userId))
      .where(
        and(
          eq(activityLogs.workspaceId, workspaceId),
          eq(activityLogs.userId, user.id) // Only show logs for the current user
        )
      )
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    return logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  } catch (error) {
    // If table doesn't exist yet, return empty array
    console.error("Error fetching activity logs:", error);
    return [];
  }
};

/**
 * Update workspace name (only owners can do this)
 */
export const updateWorkspace = async (
  workspaceId: string,
  name: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is an owner
  if (!(await canManageTeam(workspaceId))) {
    throw new Error("Only workspace owners can edit workspace settings");
  }

  // Validate name
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length === 0) {
    throw new Error("Workspace name cannot be empty");
  }
  if (trimmedName.length > 100) {
    throw new Error("Workspace name must be 100 characters or less");
  }

  try {
    await db.update(workspaces).set({ name: trimmedName }).where(eq(workspaces.id, workspaceId));

    // Log activity
    await logActivity(workspaceId, "workspace.updated", "workspace", workspaceId, {
      name: trimmedName,
    });

    revalidatePath(`/app/${workspaceId}`);
    revalidatePath(`/app/${workspaceId}/settings`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update workspace:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update workspace";
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete a workspace (only owners can do this)
 * This will delete all associated data: members, links, templates, invitations, activity logs
 */
export const deleteWorkspace = async (
  workspaceId: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is an owner
  if (!(await canManageTeam(workspaceId))) {
    throw new Error("Only workspace owners can delete workspaces");
  }

  try {
    // Verify workspace exists
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Get all links in this workspace to delete their related data
    const workspaceLinks = await db
      .select({ id: links.id })
      .from(links)
      .where(eq(links.workspaceId, workspaceId));

    const linkIds = workspaceLinks.map((link) => link.id);

    // Delete geo rules for all links
    if (linkIds.length > 0) {
      await db.delete(geoRules).where(inArray(geoRules.linkId, linkIds));
    }

    // Delete analytics for all links
    if (linkIds.length > 0) {
      await db.delete(analytics).where(inArray(analytics.linkId, linkIds));
    }

    // Delete links
    await db.delete(links).where(eq(links.workspaceId, workspaceId));

    // Delete UTM templates
    await db.delete(utmTemplates).where(eq(utmTemplates.workspaceId, workspaceId));

    // Delete workspace members
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));

    // Delete workspace invitations (should cascade, but being explicit)
    await db.delete(workspaceInvitations).where(eq(workspaceInvitations.workspaceId, workspaceId));

    // Delete activity logs (should cascade, but being explicit)
    await db.delete(activityLogs).where(eq(activityLogs.workspaceId, workspaceId));

    // Finally, delete the workspace itself
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    revalidatePath("/app");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete workspace";
    return { success: false, error: errorMessage };
  }
};
