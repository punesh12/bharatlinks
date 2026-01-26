"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  successMessage?: string;
  errorMessage?: string;
  variant?: "ghost" | "outline" | "default" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  iconClassName?: string;
}

export const CopyButton = ({
  text,
  successMessage = "Copied!",
  errorMessage = "Failed to copy",
  variant = "ghost",
  size = "icon",
  className = "",
  iconClassName = "",
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(errorMessage);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={`cursor-pointer ${className}`}
    >
      {copied ? (
        <Check className={`h-3.5 w-3.5 text-green-600 ${iconClassName}`} />
      ) : (
        <Copy className={`h-3.5 w-3.5 ${iconClassName}`} />
      )}
    </Button>
  );
};
