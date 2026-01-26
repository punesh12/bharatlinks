"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  settings: Settings,
  creditCard: CreditCard,
};

interface SettingsNavLinkProps {
  href: string;
  icon: keyof typeof iconMap;
  label: string;
  exact?: boolean;
}

export function SettingsNavLink({ href, icon, label, exact = false }: SettingsNavLinkProps) {
  const pathname = usePathname();
  
  // Improved active state detection
  let isActive = false;
  if (exact) {
    // For exact matches (like General settings), only match exact path
    // This prevents /settings/billing from being active when on /settings
    isActive = pathname === href;
  } else {
    // For non-exact matches (like Billing), match exact or sub-paths
    // Match if pathname equals href OR pathname starts with href + "/"
    // This ensures /settings/billing/something also highlights billing
    isActive = pathname === href || (pathname.startsWith(href + "/") && pathname.length > href.length);
  }
  
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all whitespace-nowrap relative group",
        "hover:bg-slate-50 hover:text-slate-900",
        isActive
          ? "bg-blue-50 text-blue-900 font-semibold"
          : "text-slate-600"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r-full" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}
