"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { format } from "date-fns";
import { Loader2, Link2, UserPlus, UserMinus, Shield, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getActivityLogs } from "@/lib/actions/team";

interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

interface ActivityLogsProps {
  workspaceId: string;
}

const getActionIcon = (action: string) => {
  if (action.includes("link.created")) return Link2;
  if (action.includes("link.updated")) return Edit;
  if (action.includes("link.deleted")) return Trash2;
  if (action.includes("member.invited") || action.includes("member.joined")) return UserPlus;
  if (action.includes("member.removed")) return UserMinus;
  if (action.includes("role.changed")) return Shield;
  return Link2;
};

const getActionLabel = (action: string, metadata: Record<string, unknown> | null) => {
  if (action === "link.created") {
    return `Created link /${metadata?.shortCode || "unknown"}`;
  }
  if (action === "link.updated") {
    return `Updated link /${metadata?.shortCode || "unknown"}`;
  }
  if (action === "link.deleted") {
    return `Deleted link /${metadata?.shortCode || "unknown"}`;
  }
  if (action === "member.invited") {
    return `Invited ${metadata?.email || "member"} as ${metadata?.role || "member"}`;
  }
  if (action === "member.joined") {
    return `Joined the workspace`;
  }
  if (action === "member.removed") {
    return `Removed member from workspace`;
  }
  if (action === "role.changed") {
    return `Changed role from ${metadata?.oldRole || "unknown"} to ${metadata?.newRole || "unknown"}`;
  }
  if (action === "member.invitation_cancelled") {
    return `Cancelled invitation for ${metadata?.email || "member"}`;
  }
  return action;
};

export const ActivityLogs = ({ workspaceId }: ActivityLogsProps) => {
  const [logs, setLogs] = React.useState<ActivityLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await getActivityLogs(workspaceId, 50);
        setLogs(data as ActivityLog[]);
      } catch (error) {
        console.error("Failed to load activity logs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [workspaceId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Your activity in this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No activity yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>Track all team activity in this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => {
            const Icon = getActionIcon(log.action);
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{log.userEmail}</p>
                    <Badge variant="outline" className="text-xs">
                      {log.entityType}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {getActionLabel(log.action, log.metadata)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
