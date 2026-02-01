"use client";

import { Tag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/utils/tags";

interface TagOption {
  id: string;
  name: string;
}

interface TagDropdownProps {
  isOpen: boolean;
  newTagInput: string;
  availableTags: TagOption[];
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
  onAddNewTag: (tagName: string) => void;
}

export const TagDropdown = ({
  isOpen,
  newTagInput,
  availableTags,
  selectedTags,
  onToggleTag,
  onAddNewTag,
}: TagDropdownProps) => {
  if (!isOpen) return null;

  const canAddNewTag =
    newTagInput.trim() &&
    !availableTags.some((tag) => tag.name.toLowerCase() === newTagInput.trim().toLowerCase()) &&
    !selectedTags.includes(newTagInput.trim().toLowerCase());

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
      {/* Show option to add new tag if input has value */}
      {canAddNewTag && (
        <button
          type="button"
          onClick={() => onAddNewTag(newTagInput)}
          className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-200"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="h-4 w-4 border border-slate-300 rounded flex items-center justify-center flex-shrink-0">
              <Tag className="h-3 w-3 text-slate-400" />
            </div>
            <span className="text-sm text-slate-600">Add &quot;{newTagInput.trim()}&quot;</span>
          </div>
        </button>
      )}

      {/* Show available tags */}
      {availableTags.length > 0
        ? availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name.toLowerCase());
            const colors = getTagColor(tag.name);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(tag.name)}
                className={cn(
                  "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0",
                  isSelected && "bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={cn(
                      "h-4 w-4 border rounded flex items-center justify-center flex-shrink-0",
                      isSelected ? "bg-slate-700 border-slate-700" : "border-slate-300"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <Tag className={cn("h-4 w-4 flex-shrink-0", colors.icon)} />
                  <span className="text-sm text-slate-900">{tag.name}</span>
                </div>
              </button>
            );
          })
        : !newTagInput.trim() && (
            <div className="px-3 py-4 text-center text-sm text-slate-500">
              No tags available. Tags will appear here as you create links.
            </div>
          )}
    </div>
  );
};
