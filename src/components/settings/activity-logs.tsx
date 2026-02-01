"use client";

import { useState, useEffect, memo, useMemo, createElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/date";
import { Loader2, Link2, UserPlus, UserMinus, Shield, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getActivityLogs } from "@/lib/actions/team";
import { Pagination } from "@/components/shared/pagination";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await getActivityLogs(workspaceId, currentPage, 20);
        if (data && "logs" in data) {
          setLogs(data.logs as ActivityLog[]);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        } else {
          // Fallback for old API format
          setLogs((data as ActivityLog[]) || []);
          setTotalPages(1);
          setTotalCount((data as ActivityLog[])?.length || 0);
        }
      } catch (error) {
        console.error("Failed to load activity logs:", error);
        setLogs([]);
        setTotalPages(0);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [workspaceId, currentPage]);

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
        <CardDescription>
          Track all team activity in this workspace
          {totalCount > 0 && ` (${totalCount} total)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <ActivityLogItem key={log.id} log={log} />
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            useUrlParams={true}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Memoized ActivityLogItem component to prevent unnecessary re-renders
const ActivityLogItem = memo(({ log }: { log: ActivityLog }) => {
  // Memoize expensive computations
  const actionLabel = useMemo(
    () => getActionLabel(log.action, log.metadata),
    [log.action, log.metadata]
  );
  const formattedDate = useMemo(() => formatDateTime(log.createdAt), [log.createdAt]);

  // Get icon component reference (not creating during render)
  const IconComponent = useMemo(() => getActionIcon(log.action), [log.action]);

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg">
      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        {createElement(IconComponent, { className: "h-4 w-4 text-slate-600" })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">{log.userEmail}</p>
          <Badge variant="outline" className="text-xs">
            {log.entityType}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mt-1">{actionLabel}</p>
        <p className="text-xs text-slate-400 mt-1">{formattedDate}</p>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.log.id === nextProps.log.id &&
    prevProps.log.action === nextProps.log.action &&
    prevProps.log.userEmail === nextProps.log.userEmail &&
    prevProps.log.entityType === nextProps.log.entityType &&
    prevProps.log.createdAt === nextProps.log.createdAt &&
    JSON.stringify(prevProps.log.metadata) === JSON.stringify(nextProps.log.metadata)
  );
});

ActivityLogItem.displayName = "ActivityLogItem";
