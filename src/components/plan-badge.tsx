"use client";

import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Building2 } from "lucide-react";
import { type PlanTier, PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: PlanTier;
  className?: string;
}

export const PlanBadge = ({ plan, className }: PlanBadgeProps) => {
  const planConfig = PLANS[plan];

  const getIcon = () => {
    switch (plan) {
      case "starter":
        return <Zap className="h-3 w-3" />;
      case "pro":
        return <Crown className="h-3 w-3" />;
      case "organization":
        return <Building2 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getVariant = (): "default" | "secondary" | "outline" => {
    switch (plan) {
      case "free":
        return "outline";
      case "starter":
        return "default";
      case "pro":
        return "default";
      case "organization":
        return "default";
    }
  };

  const getColor = () => {
    switch (plan) {
      case "free":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "starter":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "pro":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "organization":
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  if (plan === "free") {
    return null; // Don't show badge for free plan
  }

  return (
    <Badge
      variant={getVariant()}
      className={cn("flex items-center gap-1.5", getColor(), className)}
    >
      {getIcon()}
      <span className="text-xs font-medium">{planConfig.name}</span>
    </Badge>
  );
};
