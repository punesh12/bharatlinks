"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspace } from "@/lib/actions/team";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { DeleteWorkspaceModal } from "./delete-workspace-modal";

interface WorkspaceEditFormProps {
  workspaceId: string;
  currentName: string;
}

export function WorkspaceEditForm({ workspaceId, currentName }: WorkspaceEditFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(currentName);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const handleSave = async () => {
    if (!name.trim() || name.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateWorkspace(workspaceId, name.trim());

      if (result.success) {
        toast.success("Workspace updated successfully");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update workspace");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update workspace";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <>
        <DeleteWorkspaceModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          workspaceId={workspaceId}
          workspaceName={currentName}
        />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <div className="flex items-center gap-2">
              <Input id="workspace-name" value={name} readOnly className="bg-slate-50" />
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>
          <div className="border-t pt-4">
            <Label className="text-red-600">Danger Zone</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Once you delete a workspace, there is no going back. Please be certain.
            </p>
            <Button onClick={() => setDeleteModalOpen(true)} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Workspace
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="workspace-name-edit">Workspace Name</Label>
        <Input
          id="workspace-name-edit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workspace name"
          maxLength={100}
          disabled={isSaving}
        />
        <p className="text-xs text-muted-foreground">{name.length}/100 characters</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || name.trim() === currentName}
          size="sm"
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
        <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
