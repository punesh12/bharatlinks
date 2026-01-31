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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLink, getAllTags } from "@/lib/actions/links";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download,
  Copy,
  Check,
  QrCode,
  IndianRupee,
  Link as LinkIcon,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Share2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { TagsInput } from "@/components/ui/tags-input";
import { UpgradeModal } from "@/components/upgrade-modal";
import { getUserPlan, getRemainingLinks } from "@/lib/utils/plans";
import { type PlanTier } from "@/lib/plans";
import { UtmModal } from "@/components/utm-modal";

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
  const [open, setOpen] = React.useState(false);
  const [source, setSource] = React.useState("");
  const [medium, setMedium] = React.useState("");
  const [campaign, setCampaign] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [content, setContent] = React.useState("");
  const [referral, setReferral] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successData, setSuccessData] = React.useState<{
    shortCode: string;
    fullUrl: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Social Preview States
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [showSocial, setShowSocial] = React.useState(false);
  const [linkType, setLinkType] = React.useState<"standard" | "upi">("standard");
  const [tags, setTags] = React.useState<string[]>([]);
  const [availableTags, setAvailableTags] = React.useState<{ id: string; name: string }[]>([]);
  const [longUrl, setLongUrl] = React.useState("");
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState<PlanTier>("free");
  const [linkLimit, setLinkLimit] = React.useState<{
    remaining: number | null;
    used: number;
    limit: number | null;
  } | null>(null);
  const [utmModalOpen, setUtmModalOpen] = React.useState(false);
  const [hostname, setHostname] = React.useState("bharatlinks.in");

  // Fetch available tags and plan info when modal opens
  React.useEffect(() => {
    if (open) {
      getAllTags(workspaceId)
        .then(setAvailableTags)
        .catch(() => setAvailableTags([]));
      // Fetch plan info
      getUserPlan()
        .then(setCurrentPlan)
        .catch(() => setCurrentPlan("free"));
      getRemainingLinks(workspaceId)
        .then(setLinkLimit)
        .catch(() => setLinkLimit(null));
    }
    // Set hostname on client side only to avoid hydration mismatch
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, [open, workspaceId]);

  const handleCopy = async () => {
    if (!successData) return;
    try {
      await navigator.clipboard.writeText(successData.fullUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector("#new-qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qrcode-${successData?.shortCode}.png`;
    link.href = url;
    link.click();
  };

  const reset = () => {
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
  };

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

  // Function to build URL with UTM parameters
  const buildUrlWithUtm = (baseUrl: string): string => {
    if (!baseUrl || !baseUrl.trim()) return baseUrl;

    const params: string[] = [];
    if (source) params.push(`utm_source=${encodeURIComponent(source).replace(/%20/g, "+")}`);
    if (medium) params.push(`utm_medium=${encodeURIComponent(medium).replace(/%20/g, "+")}`);
    if (campaign) params.push(`utm_campaign=${encodeURIComponent(campaign).replace(/%20/g, "+")}`);
    if (term) params.push(`utm_term=${encodeURIComponent(term).replace(/%20/g, "+")}`);
    if (content) params.push(`utm_content=${encodeURIComponent(content).replace(/%20/g, "+")}`);
    if (referral) params.push(`ref=${encodeURIComponent(referral).replace(/%20/g, "+")}`);

    if (params.length === 0) return baseUrl;

    // Remove existing query string if present
    const urlWithoutParams = baseUrl.split("?")[0];
    return `${urlWithoutParams}?${params.join("&")}`;
  };

  // Handle UTM modal close - append UTM params to destination URL
  const handleUtmModalClose = () => {
    if (longUrl && linkType === "standard") {
      const urlWithUtm = buildUrlWithUtm(longUrl);
      setLongUrl(urlWithUtm);
    }
    setUtmModalOpen(false);
  };

  return (
    <>
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={currentPlan}
        reason={
          linkLimit?.limit && linkLimit.remaining === 0
            ? `You've reached your monthly limit of ${linkLimit.limit} links. Upgrade to create more.`
            : undefined
        }
        limit={linkLimit?.limit || undefined}
        currentCount={linkLimit?.used}
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
                    if (limitMatch && linkLimit) {
                      // Modal will use linkLimit state which is already set
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

                    {/* Destination URL */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="longUrl" className="text-sm font-medium">
                          {linkType === "standard" ? "Destination URL" : "Payment Details"}
                        </Label>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                      </div>

                      {linkType === "standard" ? (
                        <Input
                          id="longUrl"
                          name="longUrl"
                          value={longUrl}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          placeholder="https://example.com/very-long-path"
                          required
                          className={urlError ? "border-red-500 focus-visible:ring-red-500" : ""}
                          title={longUrl.includes("?") ? longUrl : undefined}
                        />
                      ) : (
                        <div className="grid gap-3">
                          <input
                            type="hidden"
                            name="longUrl"
                            value="https://bharatlinks.in/upi-redirect"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="upiVpa" className="text-xs">
                                UPI ID (VPA)
                              </Label>
                              <Input
                                id="upiVpa"
                                name="upiVpa"
                                placeholder="punesh@okaxis"
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="upiName" className="text-xs">
                                Merchant Name
                              </Label>
                              <Input id="upiName" name="upiName" placeholder="Punesh Borkar" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="upiAmount" className="text-xs">
                                Amount (Optional)
                              </Label>
                              <Input
                                id="upiAmount"
                                name="upiAmount"
                                type="number"
                                placeholder="500"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="upiNote" className="text-xs">
                                Payment Note
                              </Label>
                              <Input id="upiNote" name="upiNote" placeholder="Dinner Bill" />
                            </div>
                          </div>
                        </div>
                      )}
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
                          placeholder="diwali-sale"
                          className="rounded-l-none"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Leave empty for auto-generated code</p>
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
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center min-h-[120px]">
                        {longUrl || linkType === "upi" ? (
                          <QRCodeCanvas
                            value={
                              linkType === "upi"
                                ? "upi://pay?pa=example@bank&pn=Merchant&am=100&cu=INR"
                                : longUrl || "https://example.com"
                            }
                            size={100}
                            level="H"
                          />
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
                <div className="flex items-center gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUtmModalOpen(true)}
                    disabled={linkType !== "standard" || !longUrl || !!urlError}
                    className="flex items-center gap-2 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Share2 className="h-4 w-4" />
                    UTM
                    {(source || medium || campaign || term || content || referral) && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {(source ? 1 : 0) +
                          (medium ? 1 : 0) +
                          (campaign ? 1 : 0) +
                          (term ? 1 : 0) +
                          (content ? 1 : 0) +
                          (referral ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Link"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
