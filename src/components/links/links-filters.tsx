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
import { Search, Tag, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Tag {
  id: string;
  name: string;
}

interface LinksFiltersProps {
  tags?: Tag[];
}

export const LinksFilters = ({ tags = [] }: LinksFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );

  const updateURL = (updates: Record<string, string | null>) => {
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
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    updateURL({ search: value || null });
  };

  const handleSortBy = (value: string) => {
    setSortBy(value);
    updateURL({ sortBy: value });
  };

  const handleSortOrder = (value: string) => {
    setSortOrder(value);
    updateURL({ sortOrder: value });
  };

  const toggleTag = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter((name) => name !== tagName)
      : [...selectedTags, tagName];
    setSelectedTags(newTags);
    updateURL({ tags: newTags.length > 0 ? newTags.join(",") : null });
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setSelectedTags([]);
    router.push("?page=1");
  };

  const hasActiveFilters =
    search || sortBy !== "createdAt" || sortOrder !== "desc" || selectedTags.length > 0;

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

        {/* Tags Filter - Inline */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap flex-1 lg:flex-initial min-w-0">
            <Tag className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 text-xs whitespace-nowrap ${
                      isSelected
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                        : "bg-white hover:bg-blue-50 hover:border-blue-300 border-slate-300 text-slate-700"
                    }`}
                    onClick={() => toggleTag(tag.name)}
                  >
                    {tag.name}
                    {isSelected && <X className="h-3 w-3 ml-1 inline-block" />}
                  </Badge>
                );
              })}
            </div>
          </div>
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
