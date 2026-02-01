"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode } from "lucide-react";
import Image from "next/image";

interface LinkPreviewSectionProps {
  longUrl: string;
  linkType: "standard" | "upi";
  showSocial: boolean;
  title: string;
  description: string;
  imageUrl: string;
  onShowSocialChange: (show: boolean) => void;
}

export const LinkPreviewSection = ({
  longUrl,
  linkType,
  showSocial,
  title,
  description,
  imageUrl,
  onShowSocialChange,
}: LinkPreviewSectionProps) => {
  const qrValue =
    linkType === "upi"
      ? "upi://pay?pa=example@bank&pn=Merchant&am=100&cu=INR"
      : longUrl || "https://example.com";

  return (
    <div className="hidden lg:block space-y-4 sticky top-0">
      {/* QR Code Preview */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">QR Code</Label>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center min-h-[120px]">
          {longUrl || linkType === "upi" ? (
            <QRCodeCanvas value={qrValue} size={100} level="H" />
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
          <Switch checked={showSocial} onCheckedChange={onShowSocialChange} />
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
                loading="lazy"
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
  );
};
