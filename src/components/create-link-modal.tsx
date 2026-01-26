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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLink, getAllTags } from "@/lib/actions/links";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Copy, Check, QrCode, IndianRupee, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Share2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { TagsInput } from "@/components/ui/tags-input";
import { UpgradeModal } from "@/components/upgrade-modal";
import { getUserPlan, getRemainingLinks } from "@/lib/utils/plans";
import { type PlanTier } from "@/lib/plans";

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

  // Fetch available tags and plan info when modal opens
  React.useEffect(() => {
    if (open) {
      getAllTags(workspaceId).then(setAvailableTags).catch(() => setAvailableTags([]));
      // Fetch plan info
      getUserPlan().then(setCurrentPlan).catch(() => setCurrentPlan("free"));
      getRemainingLinks(workspaceId)
        .then(setLinkLimit)
        .catch(() => setLinkLimit(null));
    }
  }, [open, workspaceId]);

  const handleTemplateChange = (templateId: string) => {
    const t = templates.find((x) => x.id === templateId);
    if (t) {
      setSource(t.source || "");
      setMedium(t.medium || "");
      setCampaign(t.campaign || "");
    }
  };

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
    setLongUrl(value);
    if (value.trim()) {
      const error = validateUrl(value);
      setUrlError(error);
    } else {
      setUrlError(null);
    }
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
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {successData ? "Link Created Successfully!" : "Create Short Link"}
          </DialogTitle>
          <DialogDescription>
            {successData
              ? "Your new link is ready to share. Scan the QR code or copy the link below."
              : "Paste your long URL and optionally add tracking parameters."}
          </DialogDescription>
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
                const urlValue = formData.get("longUrl") as string;
                const error = validateUrl(urlValue);
                if (error) {
                  setUrlError(error);
                  toast.error(error);
                  return;
                }
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
          >
            <div className="flex flex-col gap-6 py-4 overflow-y-auto max-h-[60vh] px-1">
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

              {/* Basics Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {linkType === "standard" ? "Destination" : "Payment Details"}
                </h4>

                {linkType === "standard" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="longUrl">Target URL</Label>
                    <Input
                      id="longUrl"
                      name="longUrl"
                      value={longUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://google.com/very-long-path"
                      required
                      className={urlError ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {urlError && (
                      <p className="text-sm text-red-600 mt-1">{urlError}</p>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <input
                      type="hidden"
                      name="longUrl"
                      value="https://bharatlinks.in/upi-redirect"
                    />
                    <div className="grid gap-2">
                      <Label htmlFor="upiVpa">UPI ID (VPA)</Label>
                      <Input id="upiVpa" name="upiVpa" placeholder="punesh@okaxis" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="upiName">Merchant/Name</Label>
                        <Input id="upiName" name="upiName" placeholder="Punesh Borkar" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="upiAmount">Amount (Optional)</Label>
                        <Input id="upiAmount" name="upiAmount" type="number" placeholder="500" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="upiNote">Payment Note</Label>
                      <Input id="upiNote" name="upiNote" placeholder="Dinner Bill" />
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="shortCode">Custom Alias (Optional)</Label>
                  <Input id="shortCode" name="shortCode" placeholder="diwali-sale" />
                </div>

                <TagsInput
                  value={tags}
                  onChange={setTags}
                  availableTags={availableTags}
                />
              </div>

              <hr className="border-slate-100" />

              {/* Social Preview Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Social Preview
                    </h4>
                  </div>
                  <Switch checked={showSocial} onCheckedChange={setShowSocial} />
                </div>

                {showSocial && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Social Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Great Deal on Diwali!"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Social Description</Label>
                        <Input
                          id="description"
                          name="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Get 50% off on all products..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="imageUrl">Thumbnail Image URL</Label>
                        <Input
                          id="imageUrl"
                          name="imageUrl"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-tight">
                        WhatsApp Preview
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
                          <p className="text-[#667781] text-[10px] mt-0.5">BHARATLINKS.IN</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* UTM Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Tracking (UTMs)
                </h4>
                <div className="grid gap-2">
                  <Label>Template</Label>
                  <Select onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="utm_source"
                      className="text-[10px] font-bold uppercase text-slate-400"
                    >
                      Source
                    </Label>
                    <Input
                      id="utm_source"
                      name="utm_source"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="instagram"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="utm_medium"
                      className="text-[10px] font-bold uppercase text-slate-400"
                    >
                      Medium
                    </Label>
                    <Input
                      id="utm_medium"
                      name="utm_medium"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      placeholder="social"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="utm_campaign"
                      className="text-[10px] font-bold uppercase text-slate-400"
                    >
                      Campaign
                    </Label>
                    <Input
                      id="utm_campaign"
                      name="utm_campaign"
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      placeholder="sale"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Generate Smart Link"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
