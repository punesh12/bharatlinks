"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Copy, Trash2, ArrowRight, Globe, Wifi, Flag, Search, FileText, Gift } from "lucide-react";
import { toast } from "sonner";
import { deleteUtmTemplate } from "@/lib/actions/utms";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils/date";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UtmTemplate {
  id: string;
  name: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  createdAt: Date;
}

interface UtmTemplatesListProps {
  templates: UtmTemplate[];
  workspaceId: string;
  userImageUrl?: string | null;
}

const utmFieldIcons = {
  source: Globe,
  medium: Wifi,
  campaign: Flag,
  term: Search,
  content: FileText,
  referral: Gift,
} as const;

export function UtmTemplatesList({ templates, workspaceId, userImageUrl }: UtmTemplatesListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await deleteUtmTemplate(templateToDelete, workspaceId);
      toast.success("Template deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete template");
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleCopy = (template: UtmTemplate) => {
    const params: string[] = [];
    if (template.source) params.push(`utm_source=${encodeURIComponent(template.source)}`);
    if (template.medium) params.push(`utm_medium=${encodeURIComponent(template.medium)}`);
    if (template.campaign) params.push(`utm_campaign=${encodeURIComponent(template.campaign)}`);
    if (template.term) params.push(`utm_term=${encodeURIComponent(template.term)}`);
    if (template.content) params.push(`utm_content=${encodeURIComponent(template.content)}`);

    const utmString = params.length > 0 ? `?${params.join("&")}` : "";
    navigator.clipboard.writeText(utmString);
    toast.success("UTM parameters copied to clipboard");
  };

  return (
    <>
      <div className="space-y-1.5">
        {templates.map((template) => (
            <Card
              key={template.id}
              className="group hover:shadow-md transition-all duration-200 border-slate-200 hover:border-slate-300 py-1.5"
            >
              <div className="flex items-center justify-between py-1.5 px-4 gap-4">
                {/* Left: Icon, Name, Avatar */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="font-medium text-sm text-slate-900 truncate">{template.name}</span>
                    {userImageUrl && (
                      <Avatar className="h-5 w-5 shrink-0">
                        <AvatarImage src={userImageUrl} alt="User" />
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                {/* Middle: UTM Parameter Icons */}
                <Popover open={openPopoverId === template.id} onOpenChange={(open) => setOpenPopoverId(open ? template.id : null)}>
                  <PopoverTrigger asChild>
                    <div
                      className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      onMouseEnter={() => setOpenPopoverId(template.id)}
                      onMouseLeave={() => setOpenPopoverId(null)}
                    >
                      {[
                        { key: "source", value: template.source, icon: utmFieldIcons.source },
                        { key: "medium", value: template.medium, icon: utmFieldIcons.medium },
                        { key: "campaign", value: template.campaign, icon: utmFieldIcons.campaign },
                        { key: "term", value: template.term, icon: utmFieldIcons.term },
                        { key: "content", value: template.content, icon: utmFieldIcons.content },
                        { key: "referral", value: null, icon: utmFieldIcons.referral }, // Placeholder for 6th icon
                      ].map((param) => {
                        const Icon = param.icon;
                        const hasValue = !!param.value;
                        return (
                          <div
                            key={param.key}
                            className={`h-7 w-7 rounded border flex items-center justify-center transition-colors ${
                              hasValue
                                ? "border-slate-200 bg-white hover:bg-slate-50"
                                : "border-slate-200 bg-slate-50 opacity-50"
                            }`}
                            title={hasValue ? `${param.key}: ${param.value}` : `${param.key} (not set)`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${hasValue ? "text-slate-600" : "text-slate-400"}`} />
                          </div>
                        );
                      })}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 p-3"
                    align="start"
                    side="bottom"
                    onMouseEnter={() => setOpenPopoverId(template.id)}
                    onMouseLeave={() => setOpenPopoverId(null)}
                  >
                    <div className="space-y-2">
                      {[
                        { label: "Source", value: template.source },
                        { label: "Medium", value: template.medium },
                        { label: "Campaign", value: template.campaign },
                        { label: "Term", value: template.term },
                        { label: "Content", value: template.content },
                        { label: "Referral", value: null },
                      ].map((param) => (
                        <div key={param.label} className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-medium text-slate-900">{param.label}</span>
                          <span className="text-slate-500 truncate text-right max-w-[140px]">
                            {param.value || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Right: Date and Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-600 whitespace-nowrap">{formatDate(template.createdAt)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopy(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy UTM Parameters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(template.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
