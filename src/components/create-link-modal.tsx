"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createLink } from "@/lib/actions/links";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download,
  Copy,
  Check,
  IndianRupee,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateUrl } from "@/lib/utils/url-validation";
import dynamic from "next/dynamic";
import { buildUrlWithUtm } from "@/lib/utils/url";
import { LinkFormFields } from "./links/link-form-fields";
import { SocialPreviewSection } from "./links/social-preview-section";
import { LinkPreviewSection } from "./links/link-preview-section";
import { LinkFormActions } from "./links/link-form-actions";
import { useHostname } from "@/hooks/use-hostname";
import { useLinkFormData } from "@/hooks/use-link-form-data";

// Lazy load rarely used modals
const UpgradeModal = dynamic(() => import("@/components/upgrade-modal").then((m) => m.UpgradeModal), {
  ssr: false,
});
const UtmModal = dynamic(() => import("@/components/utm-modal").then((m) => m.UtmModal), {
  ssr: false,
});

type UtmTemplate = {
  id: string;
  name: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
};

export const CreateLinkModal = ({
  workspaceId,
  templates,
}: {
  workspaceId: string;
  templates: UtmTemplate[];
}) => {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [referral, setReferral] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    shortCode: string;
    fullUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Social Preview States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showSocial, setShowSocial] = useState(false);
  const [linkType, setLinkType] = useState<"standard" | "upi">("standard");
  const [tags, setTags] = useState<string[]>([]);
  const [longUrl, setLongUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [utmModalOpen, setUtmModalOpen] = useState(false);

  // Custom hooks
  const hostname = useHostname();
  const { availableTags, currentPlan, linkUsage } = useLinkFormData(workspaceId, open);

  const handleCopy = useCallback(async () => {
    if (!successData) return;
    try {
      await navigator.clipboard.writeText(successData.fullUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [successData]);

  const downloadQRCode = useCallback(() => {
    const canvas = document.querySelector("#new-qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qrcode-${successData?.shortCode}.png`;
    link.href = url;
    link.click();
  }, [successData?.shortCode]);

  const reset = useCallback(() => {
    setSuccessData(null);
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
    setReferral("");
    setCopied(false);
    setTags([]);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setShowSocial(false);
    setLongUrl("");
    setUrlError(null);
  }, []);

  const handleUrlChange = useCallback((value: string) => {
    // Store the base URL without UTM parameters
    const baseUrl = value.split("?")[0];
    setLongUrl(baseUrl);
    if (value.trim()) {
      const error = validateUrl(value);
      setUrlError(error);
    } else {
      setUrlError(null);
    }
  }, []);

  // Handle UTM modal close - append UTM params to destination URL
  const handleUtmModalClose = useCallback(() => {
    if (longUrl && linkType === "standard") {
      const urlWithUtm = buildUrlWithUtm(longUrl, {
        source,
        medium,
        campaign,
        term,
        content,
        referral,
      });
      setLongUrl(urlWithUtm);
    }
    setUtmModalOpen(false);
  }, [longUrl, linkType, source, medium, campaign, term, content, referral]);

  return (
    <>
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={currentPlan}
        reason={
          linkUsage?.limit && linkUsage.remaining === 0
            ? `You've reached your monthly limit of ${linkUsage.limit} links. Upgrade to create more.`
            : undefined
        }
        limit={linkUsage?.limit || undefined}
        currentCount={linkUsage?.used}
      />
      <UtmModal
        isOpen={utmModalOpen}
        onClose={handleUtmModalClose}
        templates={templates}
        source={source}
        medium={medium}
        campaign={campaign}
        term={term}
        content={content}
        referral={referral}
        longUrl={longUrl}
        onSourceChange={setSource}
        onMediumChange={setMedium}
        onCampaignChange={setCampaign}
        onTermChange={setTerm}
        onContentChange={setContent}
        onReferralChange={setReferral}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create New Link</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  {successData ? "Link Created Successfully!" : "Create New Link"}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {successData
                    ? "Your new link is ready to share. Scan the QR code or copy the link below."
                    : "Create a short link with tracking and custom previews."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {successData ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div className="p-4 bg-white border rounded-xl shadow-sm">
                <QRCodeCanvas id="new-qr-canvas" value={successData.fullUrl} size={180} level="H" />
              </div>

              <div className="flex flex-col w-full gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                  <span className="text-sm font-medium text-slate-600 truncate max-w-[280px]">
                    {successData.fullUrl}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={downloadQRCode}>
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setOpen(false);
                      reset();
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form
              action={async (formData) => {
                // Validate URL before submission (for standard links)
                if (linkType === "standard") {
                  // Use the longUrl state which already has UTM params appended
                  const urlValue = longUrl || (formData.get("longUrl") as string);
                  const error = validateUrl(urlValue);
                  if (error) {
                    setUrlError(error);
                    toast.error(error);
                    return;
                  }
                  // Update formData with the URL that includes UTM params
                  formData.set("longUrl", urlValue);
                }

                setIsSubmitting(true);
                try {
                  const createLinkWithId = createLink.bind(null, workspaceId);
                  const result = await createLinkWithId(formData);

                  if (result.success) {
                    const shortCode = result.shortCode;
                    const fullUrl = `${window.location.origin}/${shortCode}`;
                    setSuccessData({ shortCode, fullUrl });
                  }
                } catch (error) {
                  const errorMessage =
                    error instanceof Error ? error.message : "Failed to create link";

                  // Check if it's a plan limit error
                  if (errorMessage.includes("limit") || errorMessage.includes("Plan limit")) {
                    // Extract limit info from error message for better modal display
                    const limitMatch = errorMessage.match(/(\d+)\s*links/);
                    if (limitMatch && linkUsage) {
                      // Modal will use linkUsage state which is already set
                    }
                    setUpgradeOpen(true);
                    toast.error(errorMessage);
                  } else {
                    toast.error(errorMessage);
                    // If it's a URL validation error, show it in the UI
                    if (errorMessage.includes("URL") || errorMessage.includes("Invalid")) {
                      setUrlError(errorMessage);
                    }
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-1">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 py-4">
                  {/* Left Column - Main Form */}
                  <div className="space-y-6">
                    {/* Type Selection */}
                    <Tabs
                      value={linkType}
                      onValueChange={(v) => setLinkType(v as "standard" | "upi")}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="standard" className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Standard
                        </TabsTrigger>
                        <TabsTrigger value="upi" className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          UPI Express
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <input type="hidden" name="type" value={linkType} />
                    <input type="hidden" name="tags" value={tags.join(", ")} />
                    <input type="hidden" name="utm_source" value={source} />
                    <input type="hidden" name="utm_medium" value={medium} />
                    <input type="hidden" name="utm_campaign" value={campaign} />
                    <input type="hidden" name="utm_term" value={term} />
                    <input type="hidden" name="utm_content" value={content} />
                    <input type="hidden" name="ref" value={referral} />

                    <LinkFormFields
                      linkType={linkType}
                      longUrl={longUrl}
                      urlError={urlError}
                      tags={tags}
                      availableTags={availableTags}
                      hostname={hostname}
                      currentPlan={currentPlan}
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
                    linkType={linkType}
                    showSocial={showSocial}
                    title={title}
                    description={description}
                    imageUrl={imageUrl}
                    onShowSocialChange={setShowSocial}
                  />
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
                <LinkFormActions
                  linkType={linkType}
                  longUrl={longUrl}
                  urlError={urlError}
                  utmParamsCount={
                    (source ? 1 : 0) +
                    (medium ? 1 : 0) +
                    (campaign ? 1 : 0) +
                    (term ? 1 : 0) +
                    (content ? 1 : 0) +
                    (referral ? 1 : 0)
                  }
                  isSubmitting={isSubmitting}
                  onUtmClick={() => setUtmModalOpen(true)}
                />
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
