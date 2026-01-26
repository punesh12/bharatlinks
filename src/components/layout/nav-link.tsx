"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Link as LinkIcon, Settings, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  dashboard: LayoutDashboard,
  links: LinkIcon,
  analytics: BarChart,
  settings: Settings,
};

interface NavLinkProps {
  href: string;
  icon: keyof typeof iconMap;
  label: string;
  onClick?: () => void;
}

export const NavLink = ({ href, icon, label, onClick }: NavLinkProps) => {
  const pathname = usePathname();
  
  // Improved active state detection
  let isActive = false;
  if (href.endsWith("/settings")) {
    // For settings, only match exact or settings sub-routes
    isActive = pathname === href || pathname.startsWith(href + "/");
  } else {
    // For other routes, match exact path
    isActive = pathname === href;
  }
  
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span>{label}</span>
    </Link>
  );
};
