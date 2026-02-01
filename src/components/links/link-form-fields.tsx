"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import { TagsInput } from "@/components/ui/tags-input";
import { UPIFormSection } from "./upi-form-section";
import { type PlanTier } from "@/lib/plans";

interface TagOption {
  id: string;
  name: string;
}

interface LinkFormFieldsProps {
  linkType?: "standard" | "upi";
  longUrl: string;
  urlError: string | null;
  tags: string[];
  availableTags: TagOption[];
  hostname: string;
  currentPlan: PlanTier;
  shortCode?: string;
  shortCodeReadOnly?: boolean;
  onUrlChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
}

export const LinkFormFields = ({
  linkType = "standard",
  longUrl,
  urlError,
  tags,
  availableTags,
  hostname,
  currentPlan,
  shortCode,
  shortCodeReadOnly = false,
  onUrlChange,
  onTagsChange,
}: LinkFormFieldsProps) => {
  return (
    <>
      {/* Destination URL / UPI Fields */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="longUrl" className="text-sm font-medium">
            {linkType === "standard" ? "Destination URL" : "Payment Details"}
          </Label>
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
        </div>

        {linkType === "standard" ? (
          <Input
            id="longUrl"
            name="longUrl"
            value={longUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/very-long-path"
            required
            className={urlError ? "border-red-500 focus-visible:ring-red-500" : ""}
            title={longUrl.includes("?") ? longUrl : undefined}
          />
        ) : (
          <UPIFormSection />
        )}
        {urlError && <p className="text-sm text-red-600">{urlError}</p>}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Tags</Label>
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <TagsInput
          value={tags}
          onChange={onTagsChange}
          availableTags={availableTags}
          label=""
          maxTags={currentPlan === "free" ? 5 : undefined}
        />
        {currentPlan === "free" && (
          <p className="text-xs text-slate-500">
            {tags.length}/5 tags {tags.length >= 5 && "(Limit reached)"}
          </p>
        )}
      </div>

      {/* Short Link */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="shortCode" className="text-sm font-medium">
            Short Link
          </Label>
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-300 rounded-l-md text-sm text-slate-600">
            {hostname}
          </div>
          <Input
            id="shortCode"
            name="shortCode"
            value={shortCode || ""}
            placeholder={shortCodeReadOnly ? undefined : "diwali-sale"}
            readOnly={shortCodeReadOnly}
            className={shortCodeReadOnly ? "rounded-l-none bg-slate-50 cursor-not-allowed" : "rounded-l-none"}
          />
        </div>
        <p className="text-xs text-slate-500">
          {shortCodeReadOnly ? "Short link cannot be changed" : "Leave empty for auto-generated code"}
        </p>
      </div>
    </>
  );
};
