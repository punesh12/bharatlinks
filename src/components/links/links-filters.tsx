"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Tag, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect, useRef, useTransition } from "react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface LinksFiltersProps {
  tags?: Tag[];
}

// Move getSortLabel outside component to avoid recreation
const getSortLabel = (value: string) => {
  switch (value) {
    case "createdAt":
      return "Date Created";
    case "clickCount":
      return "Click Count";
    case "title":
      return "Title";
    default:
      return "Date Created";
  }
};

export const LinksFilters = ({ tags = [] }: LinksFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      params.set("page", "1");

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounced search handler
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced URL update with transition
      debounceTimerRef.current = setTimeout(() => {
        startTransition(() => {
          updateURL({ search: value || null });
        });
      }, 300);
    },
    [updateURL]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSortBy = useCallback(
    (value: string) => {
      setSortBy(value);
      updateURL({ sortBy: value });
    },
    [updateURL]
  );

  const handleSortOrder = useCallback(
    (value: string) => {
      setSortOrder(value);
      updateURL({ sortOrder: value });
    },
    [updateURL]
  );

  const toggleTag = useCallback(
    (tagName: string) => {
      setSelectedTags((prevTags) => {
        const newTags = prevTags.includes(tagName)
          ? prevTags.filter((name) => name !== tagName)
          : [...prevTags, tagName];
        startTransition(() => {
          updateURL({ tags: newTags.length > 0 ? newTags.join(",") : null });
        });
        return newTags;
      });
    },
    [updateURL, startTransition]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setSelectedTags([]);
    router.push("?page=1");
  }, [router]);

  // Memoize hasActiveFilters computation
  const hasActiveFilters = useMemo(
    () =>
      search || sortBy !== "createdAt" || sortOrder !== "desc" || selectedTags.length > 0,
    [search, sortBy, sortOrder, selectedTags.length]
  );

  return (
    <div className="space-y-4">
      {/* Search, Sort, and Filter in One Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search links..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-slate-100 rounded-full"
              onClick={() => handleSearch("")}
            >
              <X className="h-3.5 w-3.5 text-slate-500" />
            </Button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 flex-shrink-0">
          <Select value={sortBy} onValueChange={handleSortBy}>
            <SelectTrigger className="w-[140px] border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
              <SelectValue>
                <span className="text-slate-700 text-sm">{getSortLabel(sortBy)}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="clickCount">Click Count</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={handleSortOrder}>
            <SelectTrigger className="w-[130px] border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
              <SelectValue>
                <span className="text-slate-700 text-sm capitalize">
                  {sortOrder === "desc" ? "Descending" : "Ascending"}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags Filter - Popover */}
        {tags.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all",
                  selectedTags.length > 0 && "bg-blue-50 border-blue-300 text-blue-700"
                )}
              >
                <Tag className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Filter by Tags</h3>
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTags([]);
                        updateURL({ tags: null });
                      }}
                      className="h-7 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-600">Selected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTags.map((tagName) => {
                        const tag = tags.find((t) => t.name === tagName);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={tag.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 cursor-pointer text-xs px-2 py-1 flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTag(tagName);
                            }}
                          >
                            {tag.name}
                            <X className="h-3 w-3" />
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Tags */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">
                    {selectedTags.length > 0 ? "Available" : "All Tags"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {tags
                      .filter((tag) => !selectedTags.includes(tag.name))
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="bg-white hover:bg-blue-50 hover:border-blue-300 border-slate-300 text-slate-700 cursor-pointer text-xs px-2 py-1 transition-colors"
                          onClick={() => toggleTag(tag.name)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Clear Filters Button - Below, Right Aligned */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="whitespace-nowrap border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};
