"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tag, HelpCircle, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

// Generate a color for a tag based on its name
const getTagColor = (tagName: string) => {
  const colors = [
    {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: "text-yellow-600",
    },
    {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      icon: "text-orange-600",
    },
    {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: "text-amber-600",
    },
    {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: "text-blue-600",
    },
    {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-200",
      icon: "text-indigo-600",
    },
    {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: "text-purple-600",
    },
    {
      bg: "bg-pink-100",
      text: "text-pink-800",
      border: "border-pink-200",
      icon: "text-pink-600",
    },
    {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: "text-green-600",
    },
  ];

  // Simple hash function to get consistent color for same tag name
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const TagsInput = ({
  value = [],
  onChange,
  availableTags = [],
  label = "Tags",
  showManage = false,
  onManageClick,
}: TagsInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle adding a new tag
  const handleAddNewTag = (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
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
      onChange([...value, ...tags]);
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
      // Add tag if not selected
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
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

      {/* Selected Tags Display - Clickable to open dropdown */}
      <div
        onClick={() => {
          if (value.length > 0) {
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "min-h-[44px] px-3 py-2 border border-slate-300 rounded-lg bg-white flex items-start gap-2 flex-wrap transition-colors",
          value.length > 0
            ? "cursor-pointer hover:border-slate-400"
            : "cursor-text"
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
            {value.map((tag) => {
              const colors = getTagColor(tag);
              return (
                <Badge
                  key={tag}
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
                    onClick={(e) => handleRemoveTag(tag, e)}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className={cn("h-3 w-3", colors.text)} />
                  </button>
                </Badge>
              );
            })}
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
      {isOpen && (
        <div className="border border-slate-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
          {/* Show option to add new tag if input has value */}
          {newTagInput.trim() &&
            !availableTags.some(
              (tag) => tag.name.toLowerCase() === newTagInput.trim().toLowerCase()
            ) &&
            !value.includes(newTagInput.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => handleAddNewTag(newTagInput)}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-4 w-4 border border-slate-300 rounded flex items-center justify-center flex-shrink-0">
                    <Tag className="h-3 w-3 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-600">
                    Add &quot;{newTagInput.trim()}&quot;
                  </span>
                </div>
              </button>
            )}

          {/* Show available tags */}
          {availableTags.length > 0 ? (
            availableTags.map((tag) => {
              const isSelected = value.includes(tag.name.toLowerCase());
              const colors = getTagColor(tag.name);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.name)}
                  className={cn(
                    "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0",
                    isSelected && "bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={cn(
                        "h-4 w-4 border rounded flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "bg-slate-700 border-slate-700"
                          : "border-slate-300"
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
          ) : (
            !newTagInput.trim() && (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                No tags available. Tags will appear here as you create links.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
