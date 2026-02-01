"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialPreviewSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onImageUrlChange: (imageUrl: string) => void;
}

export const SocialPreviewSection = ({
  title,
  description,
  imageUrl,
  onTitleChange,
  onDescriptionChange,
  onImageUrlChange,
}: SocialPreviewSectionProps) => {
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-xs">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Add a title..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description" className="text-xs">
            Description
          </Label>
          <Input
            id="description"
            name="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add a description..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl" className="text-xs">
            Image URL
          </Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    </div>
  );
};
