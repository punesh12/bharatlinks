"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tag, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagChip } from "./tag-chip";
import { TagDropdown } from "./tag-dropdown";

interface TagOption {
  id: string;
  name: string;
}

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags?: TagOption[];
  label?: string;
  showManage?: boolean;
  onManageClick?: () => void;
  maxTags?: number;
}

export const TagsInput = ({
  value = [],
  onChange,
  availableTags = [],
  label = "Tags",
  showManage = false,
  onManageClick,
  maxTags,
}: TagsInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle adding a new tag
  const handleAddNewTag = (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      if (maxTags !== undefined && value.length >= maxTags) {
        return; // Don't add if limit reached
      }
      onChange([...value, trimmed]);
      setNewTagInput(""); // Always clear input after adding
      // Keep input focused for adding more tags
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Handle adding multiple tags from comma-separated input
  const handleAddMultipleTags = (input: string) => {
    const tags = input
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag && !value.includes(tag));

    if (tags.length > 0) {
      let tagsToAdd = tags;
      if (maxTags !== undefined) {
        const remaining = maxTags - value.length;
        if (remaining <= 0) return;
        tagsToAdd = tags.slice(0, remaining);
      }
      onChange([...value, ...tagsToAdd]);
      setNewTagInput("");
    }
  };

  // Handle toggling a tag
  const handleToggleTag = (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase();
    if (value.includes(trimmed)) {
      // Remove tag if already selected
      onChange(value.filter((tag) => tag !== trimmed));
    } else {
      // Add tag if not selected (check limit)
      if (maxTags !== undefined && value.length >= maxTags) {
        return; // Don't add if limit reached
      }
      onChange([...value, trimmed]);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening dropdown when removing
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  // Handle input keydown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      // Check if input contains commas (multiple tags)
      if (newTagInput.includes(",")) {
        handleAddMultipleTags(newTagInput);
      } else {
        handleAddNewTag(newTagInput); // Clear input after adding
      }
    } else if (e.key === "Escape") {
      setNewTagInput("");
      inputRef.current?.blur();
      setIsOpen(false);
    } else if (e.key === "Backspace" && !newTagInput && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      onChange(value.slice(0, -1));
    }
  };

  // Handle input blur - add tag if there's text
  const handleInputBlur = () => {
    // Small delay to allow click events on dropdown items to fire first
    setTimeout(() => {
      if (newTagInput.trim() && !value.includes(newTagInput.trim().toLowerCase())) {
        // If there's text in input but it wasn't added, add it
        handleAddNewTag(newTagInput);
      } else {
        setNewTagInput("");
      }
    }, 200);
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Header */}
      {label && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-slate-900">{label}</Label>
            <HelpCircle className="h-4 w-4 text-slate-400" />
          </div>
          {showManage && (
            <button
              type="button"
              onClick={onManageClick}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Manage
            </button>
          )}
        </div>
      )}

      {/* Selected Tags Display - Clickable to open dropdown */}
      <div
        onClick={() => {
          if (value.length > 0) {
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "min-h-[44px] px-3 py-2 border border-slate-300 rounded-lg bg-white flex items-start gap-2 flex-wrap transition-colors",
          value.length > 0 ? "cursor-pointer hover:border-slate-400" : "cursor-text"
        )}
      >
        {value.length === 0 ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Tag className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              value={newTagInput}
              onChange={(e) => {
                setNewTagInput(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsOpen(true)}
              onBlur={handleInputBlur}
              onClick={(e) => e.stopPropagation()}
              placeholder="Type to add tags (comma-separated or press Enter)..."
              className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm flex-1"
            />
          </div>
        ) : (
          <>
            {value.map((tag) => (
              <TagChip key={tag} tag={tag} onRemove={handleRemoveTag} />
            ))}
            {/* Input field for adding more tags when tags already exist */}
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <Input
                ref={inputRef}
                type="text"
                value={newTagInput}
                onChange={(e) => {
                  setNewTagInput(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setIsOpen(true)}
                onBlur={handleInputBlur}
                onClick={(e) => e.stopPropagation()}
                placeholder="Add more tags..."
                className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm flex-1 min-w-[120px]"
              />
            </div>
          </>
        )}
      </div>

      {/* Available Tags Dropdown */}
      <TagDropdown
        isOpen={isOpen}
        newTagInput={newTagInput}
        availableTags={availableTags}
        selectedTags={value}
        onToggleTag={handleToggleTag}
        onAddNewTag={handleAddNewTag}
      />
    </div>
  );
};
