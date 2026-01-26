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
  const isActive = pathname === href;
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-muted-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "")} />
      {label}
    </Link>
  );
};
