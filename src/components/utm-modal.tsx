"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HelpCircle, Globe, Link2, Flag, Search, FileText, Gift } from "lucide-react";
import { UtmInputField } from "@/components/utm-input-field";

type UtmTemplate = {
  id: string;
  name: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
};

interface UtmModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: UtmTemplate[];
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  referral?: string;
  longUrl: string;
  onSourceChange: (value: string) => void;
  onMediumChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  onTermChange?: (value: string) => void;
  onContentChange?: (value: string) => void;
  onReferralChange?: (value: string) => void;
}

export const UtmModal = ({
  isOpen,
  onClose,
  templates,
  source,
  medium,
  campaign,
  term = "",
  content = "",
  referral = "",
  longUrl,
  onSourceChange,
  onMediumChange,
  onCampaignChange,
  onTermChange,
  onContentChange,
  onReferralChange,
}: UtmModalProps) => {
  const [localTerm, setLocalTerm] = React.useState(term);
  const [localContent, setLocalContent] = React.useState(content);
  const [localReferral, setLocalReferral] = React.useState(referral);

  React.useEffect(() => {
    setLocalTerm(term);
    setLocalContent(content);
    setLocalReferral(referral);
  }, [term, content, referral]);

  const handleTemplateChange = (templateId: string) => {
    const t = templates.find((x) => x.id === templateId);
    if (t) {
      onSourceChange(t.source || "");
      onMediumChange(t.medium || "");
      onCampaignChange(t.campaign || "");
    }
  };

  const buildPreviewUrl = () => {
    const baseUrl = longUrl || "https://example.com";
    const params: string[] = [];

    if (source) params.push(`utm_source=${encodeURIComponent(source).replace(/%20/g, "+")}`);
    if (medium) params.push(`utm_medium=${encodeURIComponent(medium).replace(/%20/g, "+")}`);
    if (campaign) params.push(`utm_campaign=${encodeURIComponent(campaign).replace(/%20/g, "+")}`);
    if (localTerm) params.push(`utm_term=${encodeURIComponent(localTerm).replace(/%20/g, "+")}`);
    if (localContent)
      params.push(`utm_content=${encodeURIComponent(localContent).replace(/%20/g, "+")}`);
    if (localReferral) params.push(`ref=${encodeURIComponent(localReferral).replace(/%20/g, "+")}`);

    return params.length > 0 ? `${baseUrl}?${params.join("&")}` : baseUrl;
  };

  const handleSave = () => {
    if (onTermChange) onTermChange(localTerm);
    if (onContentChange) onContentChange(localContent);
    if (onReferralChange) onReferralChange(localReferral);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">UTM Builder</h2>
            <HelpCircle className="h-4 w-4 text-slate-400" />
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md border border-slate-300 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium">U</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 space-y-3">
          {/* UTM Fields */}
          <div className="space-y-3">
            <UtmInputField
              icon={Globe}
              label="Source"
              id="utm_source"
              value={source}
              onChange={onSourceChange}
              placeholder="google"
            />
            <UtmInputField
              icon={Link2}
              label="Medium"
              id="utm_medium"
              value={medium}
              onChange={onMediumChange}
              placeholder="cpc"
            />
            <UtmInputField
              icon={Flag}
              label="Campaign"
              id="utm_campaign"
              value={campaign}
              onChange={onCampaignChange}
              placeholder="summer sale"
            />
            <UtmInputField
              icon={Search}
              label="Term"
              id="utm_term"
              value={localTerm}
              onChange={setLocalTerm}
              placeholder="running shoes"
            />
            <UtmInputField
              icon={FileText}
              label="Content"
              id="utm_content"
              value={localContent}
              onChange={setLocalContent}
              placeholder="logo link"
            />
            <UtmInputField
              icon={Gift}
              label="Referral"
              id="referral"
              value={localReferral}
              onChange={setLocalReferral}
              placeholder="linkedin.com"
            />
          </div>

          {/* URL Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">URL Preview</Label>
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 min-h-[60px]">
              <p className="text-xs font-mono text-slate-700 break-all whitespace-pre-wrap leading-relaxed">
                {buildPreviewUrl()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <Select onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-[140px] h-9 border-slate-300 bg-white">
              <SelectValue placeholder="Templates" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 border-slate-300 bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
