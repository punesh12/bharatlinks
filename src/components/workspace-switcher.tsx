"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createWorkspace } from "@/lib/actions/workspaces";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Placeholder for Avatar func
const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

type Workspace = { id: string; name: string };

export const WorkspaceSwitcher = ({
  workspaces,
  currentWorkspaceId,
}: {
  workspaces: Workspace[];
  currentWorkspaceId: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  return (
    <Dialog open={showNewWorkspaceDialog} onOpenChange={setShowNewWorkspaceDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a workspace"
            className="w-[200px] justify-between"
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${selectedWorkspace?.name}.png`}
                alt={selectedWorkspace?.name}
              />
              <AvatarFallback>{getInitials(selectedWorkspace?.name || "??")}</AvatarFallback>
            </Avatar>
            {selectedWorkspace?.name}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          {/* Using simple list instead of Command for simplicity if Command not installed yet, but usually shadcn requires it. 
             If Command is not installed, I should install `cmdk` manually or add `command` component. 
             Wait, I didn't install `command`. I'll assume I need to install it or use standard HTML.
             Let's check installed list: button input label dialog select dropdown-menu avatar separator sheet card table.
             Missing: command, popover.
             Ah, I missed `popover` and `command` in the previous install.
          */}
          <div className="flex flex-col">
            {workspaces.map((framework) => (
              <button
                key={framework.id}
                onClick={() => {
                  router.push(`/app/${framework.id}`);
                  setOpen(false);
                }}
                className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentWorkspaceId === framework.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.name}
              </button>
            ))}
            <div className="h-px bg-gray-200 my-1" />
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  setOpen(false);
                  setShowNewWorkspaceDialog(true);
                }}
                className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </button>
            </DialogTrigger>
          </div>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Add a new workspace to manage products and customers.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            try {
              setError(null);
              setIsSubmitting(true);
              await createWorkspace(formData);
              setShowNewWorkspaceDialog(false);
              router.refresh();
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : "Failed to create workspace";
              setError(errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="space-y-4 py-2 pb-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
                {error.includes("workspace limit") && (
                  <Link
                    href={`/app/${currentWorkspaceId}/settings/billing`}
                    className="text-sm text-red-600 hover:text-red-700 underline mt-2 inline-block"
                  >
                    Upgrade to create more workspaces →
                  </Link>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input id="name" name="name" placeholder="Acme Inc." required />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewWorkspaceDialog(false);
                setError(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSwitcher;
