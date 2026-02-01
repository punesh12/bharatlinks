"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, X } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface PendingInvitation {
  id: string;
  email: string;
  role: "owner" | "member";
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
}

interface InvitationsListProps {
  invitations: PendingInvitation[];
  onCancelInvitation: (invitationId: string) => void;
}

export const InvitationsList = ({ invitations, onCancelInvitation }: InvitationsListProps) => {
  if (invitations.length === 0) return null;

  return (
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
                    Expires {formatDate(invitation.expiresAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancelInvitation(invitation.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
