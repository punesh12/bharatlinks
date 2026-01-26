"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, QrCode, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const QRCodeModal = dynamic(() => import("./qr-code-modal").then((m) => m.QRCodeModal), {
  ssr: false,
});
const EditLinkModal = dynamic(() => import("./edit-link-modal").then((m) => m.EditLinkModal), {
  ssr: false,
});

interface LinkCardActionsProps {
  link: {
    id: string;
    shortCode: string;
    longUrl: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
  };
}

export const LinkCardActions = ({ link }: LinkCardActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fullShortUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${link.shortCode}`
      : `/${link.shortCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("Short URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {qrOpen && (
        <QRCodeModal
          isOpen={qrOpen}
          onClose={() => setQrOpen(false)}
          shortUrl={fullShortUrl}
          shortCode={link.shortCode}
        />
      )}

      {editOpen && (
        <EditLinkModal isOpen={editOpen} onClose={() => setEditOpen(false)} link={link} />
      )}

      <a href={`/${link.shortCode}`} target="_blank" rel="noopener noreferrer">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:border-blue-200"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:border-blue-200"
        onClick={() => setEditOpen(true)}
      >
        <Settings2 className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:border-blue-200"
        onClick={() => setQrOpen(true)}
      >
        <QrCode className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:border-blue-200"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};
