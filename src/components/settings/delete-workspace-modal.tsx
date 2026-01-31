"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteWorkspace } from "@/lib/actions/team";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

export const DeleteWorkspaceModal = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: DeleteWorkspaceModalProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteWorkspace(workspaceId);

      if (result.success) {
        toast.success("Workspace deleted successfully");
        router.push("/app");
      } else {
        toast.error(result.error || "Failed to delete workspace");
        setIsDeleting(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete workspace";
      toast.error(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="relative">
          <div className="absolute -left-2 -top-2 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl pl-12">Delete Workspace</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Are you sure you want to delete this workspace? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-1">Workspace Name:</p>
            <p className="text-sm font-semibold text-slate-900">{workspaceName}</p>
          </div>
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Warning:</p>
              <p>This will permanently delete:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>All links and their analytics data</li>
                <li>All team members and invitations</li>
                <li>All UTM templates</li>
                <li>All activity logs</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Workspace
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
