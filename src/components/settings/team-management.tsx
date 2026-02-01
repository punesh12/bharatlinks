"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  cancelInvitation,
  changeMemberRole,
  getPendingInvitations,
  getTeamMembers,
  inviteTeamMember,
  leaveWorkspace,
  removeTeamMember,
} from "@/lib/actions/team";
import {
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { InviteMemberDialog } from "./invite-member-dialog";
import { TeamMembersList } from "./team-members-list";
import { InvitationsList } from "./invitations-list";

interface TeamMember {
  userId: string;
  email: string;
  role: "owner" | "member";
  joinedAt: Date;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: "owner" | "member";
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
}

interface TeamManagementProps {
  workspaceId: string;
  currentUserId: string;
  isOwner: boolean;
  limitCheck?: {
    allowed: boolean;
    reason?: string;
    currentCount?: number;
    limit?: number;
  } | null;
}

export const TeamManagement = ({
  workspaceId,
  currentUserId,
  isOwner,
  limitCheck,
}: TeamManagementProps) => {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [membersData, invitationsData] = await Promise.all([
        getTeamMembers(workspaceId),
        isOwner ? getPendingInvitations(workspaceId) : Promise.resolve([]),
      ]);
      setMembers(membersData as TeamMember[]);
      setInvitations(invitationsData as PendingInvitation[]);
    } catch {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, isOwner]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = useCallback(async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      await inviteTeamMember(workspaceId, inviteEmail.trim(), inviteRole);
      toast.success("Invitation sent successfully");
      setInviteEmail("");
      setInviteRole("member");
      setInviteDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }, [workspaceId, inviteEmail, inviteRole, loadData]);

  const handleChangeRole = useCallback(
    async (userId: string, newRole: "owner" | "member") => {
      try {
        await changeMemberRole(workspaceId, userId, newRole);
        toast.success("Role updated successfully");
        loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to change role");
      }
    },
    [workspaceId, loadData]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!confirm("Are you sure you want to remove this member?")) {
        return;
      }

      try {
        await removeTeamMember(workspaceId, userId);
        toast.success("Member removed successfully");
        loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove member");
      }
    },
    [workspaceId, loadData]
  );

  const handleCancelInvitation = useCallback(
    async (invitationId: string) => {
      try {
        await cancelInvitation(invitationId);
        toast.success("Invitation cancelled");
        loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
      }
    },
    [loadData]
  );

  const handleLeaveWorkspace = useCallback(async () => {
    setLeaveModalOpen(false);
    setLeaving(true);
    try {
      await leaveWorkspace(workspaceId);
      toast.success("You have left the workspace");
      // Redirect to first available workspace or /app
      setTimeout(() => {
        router.push("/app");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to leave workspace");
      setLeaving(false);
    }
  }, [workspaceId, router]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leave Workspace Modal */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this workspace? You will lose access to all links and
              data in this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setLeaveModalOpen(false)} disabled={leaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveWorkspace} disabled={leaving}>
              {leaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Workspace
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this workspace
                {limitCheck && limitCheck.limit !== null && (
                  <span className="ml-1 text-slate-600">
                    ({limitCheck.currentCount || members.length}/{limitCheck.limit})
                  </span>
                )}
              </CardDescription>
            </div>
            {isOwner && (
              <InviteMemberDialog
                isOpen={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                inviteEmail={inviteEmail}
                inviteRole={inviteRole}
                inviting={inviting}
                onEmailChange={setInviteEmail}
                onRoleChange={setInviteRole}
                onInvite={handleInvite}
                disabled={limitCheck ? !limitCheck.allowed : false}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {limitCheck && !limitCheck.allowed && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-800">{limitCheck.reason}</p>
            </div>
          )}
          <TeamMembersList
            members={members}
            currentUserId={currentUserId}
            isOwner={isOwner}
            leaving={leaving}
            onLeaveWorkspace={() => setLeaveModalOpen(true)}
            onChangeRole={handleChangeRole}
            onRemoveMember={handleRemoveMember}
          />
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {isOwner && <InvitationsList invitations={invitations} onCancelInvitation={handleCancelInvitation} />}
    </div>
  );
};
