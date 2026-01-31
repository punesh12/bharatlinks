"use client";

import * as React from "react";
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
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, HelpCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { TagsInput } from "@/components/ui/tags-input";
import { getUserPlan } from "@/lib/utils/plans";
import { type PlanTier } from "@/lib/plans";

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

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState(link.title || "");
  const [description, setDescription] = React.useState(link.description || "");
  const [imageUrl, setImageUrl] = React.useState(link.imageUrl || "");
  const [longUrl, setLongUrl] = React.useState(link.longUrl || "");
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState<string[]>(
    link.tags ? link.tags.map((t) => t.name.toLowerCase()) : []
  );
  const [availableTags, setAvailableTags] = React.useState<{ id: string; name: string }[]>([]);
  const [showSocial, setShowSocial] = React.useState(!!(title || description || imageUrl));
  const [currentPlan, setCurrentPlan] = React.useState<PlanTier>("free");
  const [hostname, setHostname] = React.useState("bharatlinks.in");

  // Fetch available tags and plan info when modal opens
  React.useEffect(() => {
    if (isOpen) {
      getAllTags(workspaceId)
        .then(setAvailableTags)
        .catch(() => setAvailableTags([]));
      getUserPlan()
        .then(setCurrentPlan)
        .catch(() => setCurrentPlan("free"));
    }
    // Set hostname on client side only to avoid hydration mismatch
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, [isOpen, workspaceId]);

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
    // Store the base URL without UTM parameters
    const baseUrl = value.split("?")[0];
    setLongUrl(baseUrl);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to update link";
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription className="mt-1">
            Update your link destination, tags, and social preview metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-1">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 py-4">
              {/* Left Column - Main Form */}
              <div className="space-y-6">
                {/* Destination URL */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="longUrl" className="text-sm font-medium">
                      Destination URL
                    </Label>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <Input
                    id="longUrl"
                    name="longUrl"
                    value={longUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/very-long-path"
                    required
                    className={urlError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
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
                    onChange={setTags}
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
                      value={link.shortCode}
                      readOnly
                      className="rounded-l-none bg-slate-50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Short link cannot be changed</p>
                </div>

                {/* Social Preview Fields */}
                {showSocial && (
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
                          onChange={(e) => setTitle(e.target.value)}
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
                          onChange={(e) => setDescription(e.target.value)}
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
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Previews */}
              <div className="hidden lg:block space-y-4 sticky top-0">
                {/* QR Code Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">QR Code</Label>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center min-h-[160px]">
                    {longUrl ? (
                      <QRCodeCanvas value={longUrl || "https://example.com"} size={100} level="H" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <QrCode className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Enter a URL to generate QR code</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Link Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-slate-600">Link Preview</Label>
                    <Switch checked={showSocial} onCheckedChange={setShowSocial} />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Preview"
                          width={300}
                          height={120}
                          className="w-full h-24 object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-24 bg-slate-100 flex items-center justify-center">
                          <QrCode className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                      <div className="p-3 bg-[#f0f2f5]">
                        <p className="text-[#000000] font-semibold text-sm truncate">
                          {title || "Your Link Title"}
                        </p>
                        <p className="text-[#667781] text-xs line-clamp-1">
                          {description || "Shared via BharatLinks"}
                        </p>
                        <p className="text-[#667781] text-[10px] mt-0.5">BHARATLINKS.IN</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
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
