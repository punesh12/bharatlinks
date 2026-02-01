"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ExternalLink, QrCode, Settings2, Trash2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}

interface LinkCardMenuProps {
  onOpenLink: () => void;
  onShowQrCode: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const LinkCardMenu = ({ onOpenLink, onShowQrCode, onEdit, onDelete }: LinkCardMenuProps) => {
  const menuItems: MenuItem[] = [
    {
      id: "open-link",
      label: "Open link",
      icon: ExternalLink,
      onClick: onOpenLink,
      className: "cursor-pointer",
    },
    {
      id: "qr-code",
      label: "QR Code",
      icon: QrCode,
      onClick: onShowQrCode,
      className: "cursor-pointer",
    },
    {
      id: "edit",
      label: "Edit",
      icon: Settings2,
      onClick: onEdit,
      className: "cursor-pointer",
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: onDelete,
      className: "text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer",
      iconClassName: "text-red-600",
      labelClassName: "text-red-600",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={item.onClick}
              className={item.className}
            >
              <Icon className={`h-4 w-4 ${item.iconClassName || ""}`} />
              <span className={item.labelClassName || ""}>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
