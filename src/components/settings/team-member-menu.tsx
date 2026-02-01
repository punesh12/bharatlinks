"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserCog, Trash2 } from "lucide-react";
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

interface TeamMemberMenuProps {
  currentRole: "owner" | "member";
  onChangeRole: () => void;
  onRemove: () => void;
}

export const TeamMemberMenu = ({ currentRole, onChangeRole, onRemove }: TeamMemberMenuProps) => {
  const menuItems: MenuItem[] = [
    {
      id: "change-role",
      label: `Change to ${currentRole === "owner" ? "Member" : "Owner"}`,
      icon: UserCog,
      onClick: onChangeRole,
      className: "cursor-pointer",
    },
    {
      id: "remove",
      label: "Remove from workspace",
      icon: Trash2,
      onClick: onRemove,
      className: "text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer",
      iconClassName: "text-red-600",
      labelClassName: "text-red-600",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={item.onClick}
              className={item.className}
            >
              <Icon className={`h-4 w-4 mr-2 ${item.iconClassName || ""}`} />
              <span className={item.labelClassName || ""}>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
