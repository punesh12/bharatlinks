"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, User, LogOut } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { TeamMemberMenu } from "./team-member-menu";

interface TeamMember {
  userId: string;
  email: string;
  role: "owner" | "member";
  joinedAt: Date;
}

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string;
  isOwner: boolean;
  leaving: boolean;
  onLeaveWorkspace: () => void;
  onChangeRole: (userId: string, newRole: "owner" | "member") => void;
  onRemoveMember: (userId: string) => void;
}

export const TeamMembersList = ({
  members,
  currentUserId,
  isOwner,
  leaving,
  onLeaveWorkspace,
  onChangeRole,
  onRemoveMember,
}: TeamMembersListProps) => {
  return (
    <div className="space-y-3">
      {members.map((member) => {
        const ownerCount = members.filter((m) => m.role === "owner").length;
        const canLeave =
          member.userId === currentUserId &&
          (member.role === "member" || (member.role === "owner" && ownerCount > 1));

        return (
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
                  Joined {formatDate(member.joinedAt)}
                </p>
              </div>
            </div>
            {isOwner && member.userId !== currentUserId && (
              <TeamMemberMenu
                currentRole={member.role}
                onChangeRole={() =>
                  onChangeRole(member.userId, member.role === "owner" ? "member" : "owner")
                }
                onRemove={() => onRemoveMember(member.userId)}
              />
            )}
            {canLeave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLeaveWorkspace}
                disabled={leaving}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Workspace
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};
