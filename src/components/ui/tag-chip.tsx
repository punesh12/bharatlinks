"use client";

import { Badge } from "@/components/ui/badge";
import { Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/utils/tags";

interface TagChipProps {
  tag: string;
  onRemove: (tag: string, e: React.MouseEvent) => void;
}

export const TagChip = ({ tag, onRemove }: TagChipProps) => {
  const colors = getTagColor(tag);
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-1 text-sm font-medium flex items-center gap-1.5 cursor-default",
        colors.bg,
        colors.text,
        colors.border,
        "hover:opacity-90 transition-opacity"
      )}
    >
      <Tag className={cn("h-3 w-3", colors.icon)} />
      <span>{tag}</span>
      <button
        type="button"
        onClick={(e) => onRemove(tag, e)}
        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
      >
        <X className={cn("h-3 w-3", colors.text)} />
      </button>
    </Badge>
  );
};
