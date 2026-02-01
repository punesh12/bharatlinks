"use client";

import { useState, useEffect } from "react";
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
import { createUtmTemplate } from "@/lib/actions/utms";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Globe, Smartphone, Megaphone, Search, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading, Small, Muted, Code } from "@/components/design-system";
import dynamic from "next/dynamic";
import { getUserPlan } from "@/lib/utils/plans";

const UpgradeModal = dynamic(() => import("@/components/upgrade-modal").then((m) => m.UpgradeModal), {
  ssr: false,
});

interface CreateUtmTemplateModalProps {
  workspaceId: string;
  limitInfo?: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
}


const utmFieldLabels = {
  source: "Source",
  medium: "Medium",
  campaign: "Campaign",
  term: "Term",
  content: "Content",
};

const utmFieldPlaceholders = {
  source: "e.g., instagram, facebook, newsletter",
  medium: "e.g., social, email, cpc",
  campaign: "e.g., summer-sale, product-launch",
  term: "e.g., running-shoes, keyword",
  content: "e.g., logolink, textlink",
};

export function CreateUtmTemplateModal({ workspaceId, limitInfo }: CreateUtmTemplateModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "starter" | "pro" | "organization">("free");
  const [formData, setFormData] = useState({
    name: "",
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });

  // Check if limit is reached
  const isLimitReached = limitInfo?.limit !== null && limitInfo?.remaining !== null && limitInfo?.remaining !== undefined && limitInfo?.remaining <= 0;

  // Load current plan
  useEffect(() => {
    getUserPlan().then(setCurrentPlan).catch(() => setCurrentPlan("free"));
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open && isLimitReached) {
      setIsOpen(false);
      setUpgradeOpen(true);
      return;
    }
    setIsOpen(open);
  };

  const buildPreviewUrl = () => {
    const params: string[] = [];
    if (formData.source) params.push(`utm_source=${encodeURIComponent(formData.source)}`);
    if (formData.medium) params.push(`utm_medium=${encodeURIComponent(formData.medium)}`);
    if (formData.campaign) params.push(`utm_campaign=${encodeURIComponent(formData.campaign)}`);
    if (formData.term) params.push(`utm_term=${encodeURIComponent(formData.term)}`);
    if (formData.content) params.push(`utm_content=${encodeURIComponent(formData.content)}`);

    return params.length > 0 ? `example.com?${params.join("&")}` : "example.com";
  };

  const hasAnyParams = !!(formData.source || formData.medium || formData.campaign || formData.term || formData.content);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("source", formData.source);
      data.append("medium", formData.medium);
      data.append("campaign", formData.campaign);
      data.append("term", formData.term);
      data.append("content", formData.content);

      await createUtmTemplate(data, workspaceId);
      toast.success("UTM template created successfully");
      setIsOpen(false);
      setFormData({
        name: "",
        source: "",
        medium: "",
        campaign: "",
        term: "",
        content: "",
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={currentPlan}
        reason={
          limitInfo?.limit && isLimitReached
            ? `You've reached your UTM template limit of ${limitInfo.limit}. Upgrade to create more templates.`
            : undefined
        }
        limit={limitInfo?.limit || undefined}
        currentCount={limitInfo?.used}
      />
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="shadow-sm" disabled={isLimitReached}>
            <Plus className="h-4 w-4 mr-2" />
            Create template
            <kbd className="ml-2 px-1.5 py-0.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-300 rounded">
              C
            </kbd>
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle asChild>
            <Heading level={4}>Create UTM Template</Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <Muted>Create a reusable template for UTM parameters to quickly add campaign tracking to your links.</Muted>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="name" asChild>
                <Small>
                  Template Name <span className="text-destructive">*</span>
                </Small>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Instagram Bio, Email Campaign, Facebook Ad"
                required
                className="h-10"
              />
            </div>

            {/* UTM Parameters Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label asChild>
                  <Small>UTM Parameters</Small>
                </Label>
                <Badge variant="outline" className="text-xs">
                  Optional fields
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source */}
                <div className="space-y-2">
                  <Label htmlFor="source" className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    <Small>{utmFieldLabels.source}</Small>
                  </Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder={utmFieldPlaceholders.source}
                    className="h-10"
                  />
                </div>

                {/* Medium */}
                <div className="space-y-2">
                  <Label htmlFor="medium" className="flex items-center gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-slate-500" />
                    <Small>{utmFieldLabels.medium}</Small>
                  </Label>
                  <Input
                    id="medium"
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    placeholder={utmFieldPlaceholders.medium}
                    className="h-10"
                  />
                </div>

                {/* Campaign */}
                <div className="space-y-2">
                  <Label htmlFor="campaign" className="flex items-center gap-2">
                    <Megaphone className="h-3.5 w-3.5 text-slate-500" />
                    <Small>{utmFieldLabels.campaign}</Small>
                  </Label>
                  <Input
                    id="campaign"
                    value={formData.campaign}
                    onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                    placeholder={utmFieldPlaceholders.campaign}
                    className="h-10"
                  />
                </div>

                {/* Term */}
                <div className="space-y-2">
                  <Label htmlFor="term" className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-slate-500" />
                    <Small>{utmFieldLabels.term}</Small>
                  </Label>
                  <Input
                    id="term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder={utmFieldPlaceholders.term}
                    className="h-10"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="content" className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <Small>{utmFieldLabels.content}</Small>
                  </Label>
                  <Input
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={utmFieldPlaceholders.content}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {hasAnyParams && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                    <Small weight="semibold" className="text-slate-700">Preview</Small>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-md">
                    <Code className="text-xs text-green-400 break-all">{buildPreviewUrl()}</Code>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
