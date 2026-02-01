"use client";

import { useState, useMemo, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { Link2, Calendar, MousePointerClick } from "lucide-react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { LinkCardMenu } from "./link-card-menu";

const QRCodeModal = dynamic(() => import("./qr-code-modal").then((m) => m.QRCodeModal), {
  ssr: false,
});
const EditLinkModal = dynamic(() => import("./edit-link-modal").then((m) => m.EditLinkModal), {
  ssr: false,
});
const DeleteLinkModal = dynamic(
  () => import("./delete-link-modal").then((m) => m.DeleteLinkModal),
  { ssr: false }
);

interface LinkCardProps {
  link: {
    id: string;
    shortCode: string;
    longUrl: string;
    clickCount: number;
    createdAt: Date;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    tags?: { id: string; name: string }[];
  };
}

const LinkCardComponent = ({ link }: LinkCardProps) => {
  const [qrOpen, setQrOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Ensure consistent date formatting to avoid hydration mismatch - memoized
  const formattedDate = useMemo(() => {
    const createdAtDate =
      typeof link.createdAt === "string" ? new Date(link.createdAt) : link.createdAt;
    return formatDate(createdAtDate);
  }, [link.createdAt]);

  // Compute full URL using useMemo to avoid hydration mismatch
  const fullShortUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${link.shortCode}`;
    }
    return `/${link.shortCode}`;
  }, [link.shortCode]);

  // Extract domain from longUrl - memoized to ensure consistent rendering
  const domain = useMemo(() => {
    try {
      // Use the URL as-is to avoid encoding/decoding mismatches
      const urlObj = new URL(
        link.longUrl.startsWith("http") ? link.longUrl : `https://${link.longUrl}`
      );
      return urlObj.hostname.replace("www.", "");
    } catch {
      // If URL parsing fails, return a safe truncated version
      // Don't decode here to avoid hydration mismatches
      return link.longUrl.length > 30 ? `${link.longUrl.substring(0, 30)}...` : link.longUrl;
    }
  }, [link.longUrl]);

  // Memoize callback functions
  const handleOpenLink = useCallback(() => {
    window.open(`/${link.shortCode}`, "_blank", "noopener,noreferrer");
  }, [link.shortCode]);

  const handleShowQrCode = useCallback(() => {
    setQrOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  return (
    <>
      {/* Modals */}
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

      {deleteOpen && (
        <DeleteLinkModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          link={link}
          onDeleted={() => {
            // Link will be removed via revalidation
          }}
        />
      )}

      <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 border-slate-200 bg-white">
        <CardContent>
          {/* First row: Short link, Copy icon, Click count, Menu */}
          <div className="flex items-center gap-2.5 mb-3">
            {/* Short link */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Link2 className="h-4 w-4 shrink-0 text-blue-600 transition-colors group-hover/link:text-blue-700" />
              <a
                href={`/${link.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link font-mono text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2 decoration-blue-600/30 hover:decoration-blue-700/50 transition-all cursor-pointer truncate"
              >
                /{link.shortCode}
              </a>
            </div>

            {/* Copy button */}
            <CopyButton
              text={fullShortUrl}
              successMessage="Short URL copied!"
              errorMessage="Failed to copy URL"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50"
            />

            {/* Click count */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium text-emerald-700 bg-emerald-50 shrink-0">
              <MousePointerClick className="h-3.5 w-3.5 text-emerald-600" />
              <span>{link.clickCount}</span>
            </div>
          </div>

          {/* Destination URL */}
          <div className="mb-2">
            <p className="text-xs text-slate-500 truncate font-mono">{domain}</p>
          </div>

          {/* Tags - Show at most 3 tags in a single row */}
          {/* Always reserve space for tags to maintain consistent spacing */}
          <div className="mb-3 min-h-[24px] flex gap-1.5 overflow-hidden">
            {link.tags && link.tags.length > 0 ? (
              link.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-blue-50 border-blue-200 text-blue-700 whitespace-nowrap shrink-0"
                >
                  {tag.name}
                </Badge>
              ))
            ) : (
              // Empty div to maintain spacing when no tags
              <div className="h-0" />
            )}
          </div>

          {/* Footer with metadata */}
          <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>

            {/* 3-dot menu */}
            <LinkCardMenu
              onOpenLink={handleOpenLink}
              onShowQrCode={handleShowQrCode}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Memoize LinkCard to prevent unnecessary re-renders
export const LinkCard = memo(LinkCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.link.id === nextProps.link.id &&
    prevProps.link.shortCode === nextProps.link.shortCode &&
    prevProps.link.longUrl === nextProps.link.longUrl &&
    prevProps.link.clickCount === nextProps.link.clickCount &&
    prevProps.link.createdAt === nextProps.link.createdAt &&
    prevProps.link.title === nextProps.link.title &&
    prevProps.link.description === nextProps.link.description &&
    prevProps.link.imageUrl === nextProps.link.imageUrl &&
    JSON.stringify(prevProps.link.tags) === JSON.stringify(nextProps.link.tags)
  );
});
