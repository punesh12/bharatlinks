"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, QrCode } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  shortCode: string;
}

export const QRCodeModal = ({ isOpen, onClose, shortUrl, shortCode }: QRCodeModalProps) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Short URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector("#qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qrcode-${shortCode}.png`;
    link.href = url;
    link.click();
    toast.success("QR Code downloaded!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            QR Code for /{shortCode}
          </DialogTitle>
          <DialogDescription>Scan this code to go directly to your destination.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <div className="p-6 bg-white border rounded-2xl shadow-sm" ref={canvasRef}>
            <QRCodeCanvas
              id="qr-canvas"
              value={shortUrl}
              size={200}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/logo-icon.png", // Fallback if logo exists
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
              <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
                {shortUrl}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10" onClick={downloadQRCode}>
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
