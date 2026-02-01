"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { type PlanTier, PLANS, getUpgradeSuggestion } from "@/lib/plans";
import { getRemainingLinks, getUserPlan } from "@/lib/utils/plans";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, getResetDate } from "@/lib/utils/date";
import dynamic from "next/dynamic";

// Lazy load rarely used modal
const UsageDetailsModal = dynamic(
  () => import("@/components/settings/usage-details-modal").then((m) => m.UsageDetailsModal),
  { ssr: false }
);

interface PlanUsageProps {
  workspaceId: string;
}

export const PlanUsage = ({ workspaceId }: PlanUsageProps) => {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("free");
  const [linkLimit, setLinkLimit] = useState<{
    remaining: number | null;
    used: number;
    limit: number | null;
  } | null>(null);
  const [usageModalOpen, setUsageModalOpen] = useState(false);

  useEffect(() => {
    getUserPlan()
      .then(setCurrentPlan)
      .catch(() => setCurrentPlan("free"));
    getRemainingLinks(workspaceId)
      .then(setLinkLimit)
      .catch(() => setLinkLimit(null));
  }, [workspaceId]);

  // Calculate reset date on client side only to avoid hydration mismatch
  // Use useMemo to avoid setState in effect
  const resetDate = useMemo(() => {
    if (typeof window !== "undefined") {
      return getResetDate();
    }
    return null;
  }, []);

  // Memoize expensive computations
  const upgradeSuggestionTier = useMemo(
    () => getUpgradeSuggestion(currentPlan, "links"),
    [currentPlan]
  );
  const upgradeSuggestion = useMemo(
    () => (upgradeSuggestionTier ? PLANS[upgradeSuggestionTier] : null),
    [upgradeSuggestionTier]
  );
  const showUpgrade = useMemo(() => {
    if (!linkLimit) return false;
    return (
      currentPlan === "free" ||
      linkLimit.remaining === 0 ||
      (linkLimit.remaining !== null &&
        linkLimit.limit !== null &&
        linkLimit.remaining / linkLimit.limit < 0.2)
    );
  }, [currentPlan, linkLimit]);
  const billingUrl = useMemo(() => `/app/${workspaceId}/settings/billing`, [workspaceId]);
  const planConfig = useMemo(() => PLANS[currentPlan], [currentPlan]);

  const getProgressColor = useCallback(() => {
    if (!linkLimit || !linkLimit.limit) return "bg-blue-600";
    const usagePercent = (linkLimit.used / linkLimit.limit) * 100;
    if (usagePercent >= 90) return "bg-red-500";
    if (usagePercent >= 75) return "bg-orange-500";
    if (usagePercent >= 50) return "bg-yellow-500";
    return "bg-green-500";
  }, [linkLimit]);

  const progressColor = useMemo(() => getProgressColor(), [getProgressColor]);
  const progressWidth = useMemo(() => {
    if (!linkLimit || !linkLimit.limit) return 0;
    return Math.min(100, (linkLimit.used / linkLimit.limit) * 100);
  }, [linkLimit]);

  if (!linkLimit || linkLimit.limit === null) {
    return null; // Don't show for unlimited plans
  }

  return (
    <>
      <UsageDetailsModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        linkUsage={linkLimit}
        planFeatures={planConfig.features}
        planName={planConfig.name}
      />
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Usage</h3>
        </div>

        {/* Glance Usage */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-white">
                <Link2 className="h-3 w-3 text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-900">Monthly Links</span>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {linkLimit.used} / {linkLimit.limit}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
            <div
              className={cn("h-1.5 rounded-full transition-all", progressColor)}
              style={{
                width: `${progressWidth}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {linkLimit.remaining === 0 ? (
                <span className="text-red-600 font-medium">Limit reached</span>
              ) : (
                <span>{linkLimit.remaining} remaining</span>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setUsageModalOpen(true)}
            >
              Details
            </Button>
          </div>
        </div>

        {/* Reset Date */}
        {resetDate && (
          <p className="text-xs text-slate-500" suppressHydrationWarning>
            Resets {formatDate(resetDate)}
          </p>
        )}

        {/* Upgrade Button */}
        {showUpgrade && (
          <Link href={billingUrl} className="block">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-8 rounded-md text-xs font-medium">
              {upgradeSuggestion ? `Upgrade to ${upgradeSuggestion.name}` : "Upgrade Plan"}
            </Button>
          </Link>
        )}
      </div>
    </>
  );
};
