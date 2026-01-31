"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cancelInvitation,
  changeMemberRole,
  getPendingInvitations,
  getTeamMembers,
  inviteTeamMember,
  leaveWorkspace,
  removeTeamMember,
} from "@/lib/actions/team";
import { format } from "date-fns";
import {
  AlertCircle,
  Crown,
  Loader2,
  LogOut,
  Mail,
  MoreVertical,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

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
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [invitations, setInvitations] = React.useState<PendingInvitation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"owner" | "member">("member");
  const [inviting, setInviting] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
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

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async () => {
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
  };

  const handleChangeRole = async (userId: string, newRole: "owner" | "member") => {
    try {
      await changeMemberRole(workspaceId, userId, newRole);
      toast.success("Role updated successfully");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
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
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      toast.success("Invitation cancelled");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
    }
  };

  const handleLeaveWorkspace = async () => {
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
  };

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
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={limitCheck ? !limitCheck.allowed : false}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to collaborate on this workspace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={inviteRole}
                        onValueChange={(value) => setInviteRole(value as "owner" | "member")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInvite} disabled={inviting}>
                        {inviting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    {member.role === "owner" ? (
                      <Crown className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <User className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.email}</p>
                      <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                        {member.role === "owner" ? "Owner" : "Member"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {isOwner && member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleChangeRole(
                            member.userId,
                            member.role === "owner" ? "member" : "owner"
                          )
                        }
                      >
                        Change to {member.role === "owner" ? "Member" : "Owner"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-600"
                      >
                        Remove from workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {member.userId === currentUserId &&
                  (() => {
                    // Members can always leave
                    if (member.role === "member") {
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLeaveModalOpen(true)}
                          disabled={leaving}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave Workspace
                        </Button>
                      );
                    }
                    // Owners can leave only if there are multiple owners
                    if (member.role === "owner") {
                      const ownerCount = members.filter((m) => m.role === "owner").length;
                      if (ownerCount > 1) {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLeaveModalOpen(true)}
                            disabled={leaving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave Workspace
                          </Button>
                        );
                      }
                    }
                    return null;
                  })()}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {isOwner && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Invitations waiting for acceptance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invitation.email}</p>
                        <Badge variant="outline">
                          {invitation.role === "owner" ? "Owner" : "Member"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Expires {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvitation(invitation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
