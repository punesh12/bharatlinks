import { TeamManagement } from "@/components/settings/team-management";
import { ActivityLogs } from "@/components/settings/activity-logs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { canAddTeamMember } from "@/lib/utils/plans";

const TeamPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  // Get current user's role
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  const isOwner = member?.role === "owner";

  // Only check limits if user is owner, and handle errors gracefully
  let limitCheck = null;
  if (isOwner) {
    try {
      limitCheck = await canAddTeamMember(workspaceId);
    } catch (error) {
      console.error("Error checking team member limits:", error);
      // Continue without limit check if there's an error (e.g., table doesn't exist)
      limitCheck = { allowed: true };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage team members, roles, and view activity logs.
        </p>
      </div>

      <TeamManagement
        workspaceId={workspaceId}
        currentUserId={userId}
        isOwner={isOwner}
        limitCheck={limitCheck}
      />

      <ActivityLogs workspaceId={workspaceId} />
    </div>
  );
};

export default TeamPage;
