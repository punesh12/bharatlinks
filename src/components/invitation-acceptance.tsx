"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { acceptInvitation, rejectInvitation } from "@/lib/actions/team";

interface InvitationAcceptanceProps {
  token: string;
}

export const InvitationAcceptance = ({ token }: InvitationAcceptanceProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"accept" | "reject" | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setAction("accept");
    try {
      const result = await acceptInvitation(token);
      if (result.success) {
        toast.success("Invitation accepted! Redirecting to workspace...");
        setTimeout(() => {
          router.push(`/app/${result.workspaceId}`);
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to accept invitation";
      toast.error(errorMessage);

      // If user is already a member or invitation was already processed, redirect to workspace
      if (errorMessage.includes("already") || errorMessage.includes("already accepted")) {
        // Try to get workspace ID from the error or redirect to app
        setTimeout(() => {
          router.push("/app");
        }, 2000);
      }

      setAction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setAction("reject");
    try {
      await rejectInvitation(token);
      toast.success("Invitation rejected");
      setTimeout(() => {
        router.push("/app");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject invitation");
      setAction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join a workspace. Would you like to accept?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={handleAccept} disabled={loading} className="flex-1">
              {loading && action === "accept" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </>
              )}
            </Button>
            <Button onClick={handleReject} disabled={loading} variant="outline" className="flex-1">
              {loading && action === "reject" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
