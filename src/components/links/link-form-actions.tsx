"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface LinkFormActionsProps {
  linkType: "standard" | "upi";
  longUrl: string;
  urlError: string | null;
  utmParamsCount: number;
  isSubmitting: boolean;
  onUtmClick: () => void;
}

export const LinkFormActions = ({
  linkType,
  longUrl,
  urlError,
  utmParamsCount,
  isSubmitting,
  onUtmClick,
}: LinkFormActionsProps) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onUtmClick}
        disabled={linkType !== "standard" || !longUrl || !!urlError}
        className="flex items-center gap-2 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Share2 className="h-4 w-4" />
        UTM
        {utmParamsCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {utmParamsCount}
          </span>
        )}
      </Button>
      <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Link"}
      </Button>
    </div>
  );
};
