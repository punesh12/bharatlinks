"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLink, getAllTags } from "@/lib/actions/links";
import { QrCode, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { TagsInput } from "@/components/ui/tags-input";

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: {
    id: string;
    shortCode: string;
    longUrl: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    tags?: { id: string; name: string }[];
  };
}

export const EditLinkModal = ({ isOpen, onClose, link }: EditLinkModalProps) => {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(link.title || "");
  const [description, setDescription] = useState(link.description || "");
  const [imageUrl, setImageUrl] = useState(link.imageUrl || "");
  const [longUrl, setLongUrl] = useState(link.longUrl || "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(
    link.tags ? link.tags.map((t) => t.name.toLowerCase()) : []
  );
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string }[]>([]);

  // Fetch available tags when modal opens
  useEffect(() => {
    getAllTags(workspaceId).then(setAvailableTags).catch(() => setAvailableTags([]));
  }, [workspaceId]);

  // URL validation function
  const validateUrl = (url: string): string | null => {
    if (!url || typeof url !== "string") {
      return "URL is required";
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl.length === 0) {
      return "URL cannot be empty";
    }

    // Try to parse as-is first
    try {
      const urlObj = new URL(trimmedUrl);
      // Ensure it's http or https
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        return "URL must use http:// or https:// protocol";
      }
      return null; // Valid URL
    } catch {
      // If parsing fails, try adding https://
      try {
        const urlWithProtocol = `https://${trimmedUrl}`;
        const urlObj = new URL(urlWithProtocol);
        // Validate it's a valid domain format
        if (!urlObj.hostname || urlObj.hostname.length === 0) {
          return "Invalid URL format";
        }
        // Check for basic domain pattern (at least one dot or localhost)
        if (
          !urlObj.hostname.includes(".") &&
          urlObj.hostname !== "localhost" &&
          !urlObj.hostname.match(/^\[.*\]$/) // IPv6
        ) {
          return "Invalid domain format";
        }
        return null; // Valid URL (will be normalized)
      } catch {
        return "Invalid URL format. Please enter a valid URL (e.g., https://example.com or example.com)";
      }
    }
  };

  const handleUrlChange = (value: string) => {
    setLongUrl(value);
    if (value.trim()) {
      const error = validateUrl(value);
      setUrlError(error);
    } else {
      setUrlError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate URL before submission
    const error = validateUrl(longUrl);
    if (error) {
      setUrlError(error);
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Add tags as comma-separated string
      formData.set("tags", tags.join(", "));
      await updateLink(link.id, workspaceId, formData);
      toast.success("Link updated successfully!");
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update link";
      toast.error(errorMessage);
      // If it's a URL validation error, show it in the UI
      if (errorMessage.includes("URL") || errorMessage.includes("Invalid")) {
        setUrlError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Edit Link: /{link.shortCode}
          </DialogTitle>
          <DialogDescription>
            Update your destination URL or social preview metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 py-4 overflow-y-auto max-h-[65vh] px-1">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Destination
              </h4>
              <div className="grid gap-2">
                <Label htmlFor="longUrl">URL</Label>
                <Input
                  id="longUrl"
                  name="longUrl"
                  value={longUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  required
                  className={urlError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {urlError && (
                  <p className="text-sm text-red-600 mt-1">{urlError}</p>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Social Meta
              </h4>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Social title..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Social description..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">Thumbnail Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL..."
                  />
                </div>
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  availableTags={availableTags}
                />
              </div>

              {/* Live Preview Card */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-tight">
                  WhatsApp / social Preview
                </p>
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col pointer-events-none">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-slate-200" />
                    </div>
                  )}
                  <div className="p-3 bg-[#f0f2f5]">
                    <p className="text-[#000000] font-semibold text-sm truncate">
                      {title || "Your Link Title"}
                    </p>
                    <p className="text-[#667781] text-xs line-clamp-1">
                      {description || "Shared via BharatLinks"}
                    </p>
                    <p className="text-[#667781] text-[10px] mt-0.5 uppercase">BharatLinks.in</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
