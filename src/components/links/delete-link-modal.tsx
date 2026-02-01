"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteLink } from "@/lib/actions/links";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface DeleteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: {
    id: string;
    shortCode: string;
    longUrl: string;
  };
  onDeleted?: () => void;
}

export const DeleteLinkModal = ({ isOpen, onClose, link, onDeleted }: DeleteLinkModalProps) => {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteLink(link.id, workspaceId);
      if (result.success) {
        toast.success("Link deleted successfully!");
        onDeleted?.();
        onClose();
      } else {
        toast.error(result.error || "Failed to delete link");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete link";
      console.error("Delete link error:", error);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm:max-w-[500px]"
      title={
        <div className="relative">
          <div className="absolute -left-2 -top-2 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <span className="text-xl pl-12">Delete Short Link</span>
        </div>
      }
      description="Are you sure you want to delete this link? This action cannot be undone."
      headerClassName="relative"
      footer={
        <>
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
                Delete Link
              </>
            )}
          </Button>
        </>
      }
      footerClassName="gap-3"
    >
      <div className="space-y-3">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-1">Short Link:</p>
          <p className="text-sm font-mono text-slate-900">/{link.shortCode}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-1">Destination URL:</p>
          <p className="text-sm text-slate-600 break-all word-break-break-word">{link.longUrl}</p>
        </div>
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Warning:</p>
            <p>
              All analytics data, click counts, and associated geo rules will be permanently
              deleted.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
