"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateLink } from "@/lib/actions/links";
import { toast } from "sonner";
import { validateUrl } from "@/lib/utils/url-validation";
import { LinkFormFields } from "./link-form-fields";
import { SocialPreviewSection } from "./social-preview-section";
import { LinkPreviewSection } from "./link-preview-section";
import { useHostname } from "@/hooks/use-hostname";
import { useLinkFormData } from "@/hooks/use-link-form-data";

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
  const [showSocial, setShowSocial] = useState(!!(title || description || imageUrl));

  // Custom hooks
  const hostname = useHostname();
  const { availableTags, currentPlan } = useLinkFormData(workspaceId, isOpen);


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
                <LinkFormFields
                  linkType="standard"
                  longUrl={longUrl}
                  urlError={urlError}
                  tags={tags}
                  availableTags={availableTags}
                  hostname={hostname}
                  currentPlan={currentPlan}
                  shortCode={link.shortCode}
                  shortCodeReadOnly={true}
                  onUrlChange={handleUrlChange}
                  onTagsChange={setTags}
                />

                {/* Social Preview Fields */}
                {showSocial && (
                  <SocialPreviewSection
                    title={title}
                    description={description}
                    imageUrl={imageUrl}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onImageUrlChange={setImageUrl}
                  />
                )}
              </div>

              {/* Right Column - Previews */}
              <LinkPreviewSection
                longUrl={longUrl}
                linkType="standard"
                showSocial={showSocial}
                title={title}
                description={description}
                imageUrl={imageUrl}
                onShowSocialChange={setShowSocial}
              />
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
