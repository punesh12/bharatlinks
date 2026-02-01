"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanTier, getUpgradeSuggestion } from "@/lib/plans";
import { PlanBadge } from "@/components/plan-badge";
import { cn } from "@/lib/utils";
import { formatDate, getNextBillingDate } from "@/lib/utils/date";
import { getUserPlan, getRemainingLinks } from "@/lib/utils/plans";
import dynamic from "next/dynamic";

// Lazy load rarely used modal
const UsageDetailsModal = dynamic(
  () => import("@/components/settings/usage-details-modal").then((m) => m.UsageDetailsModal),
  { ssr: false }
);
import { useParams } from "next/navigation";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { BillingPlanCard } from "@/components/settings/billing-plan-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentMethod } from "@/components/settings/payment-method";
import { BillingHistory } from "@/components/settings/billing-history";
import { ErrorBoundary } from "@/components/shared/error-boundary";


const BillingPage = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [, startTransition] = useTransition();
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("free");
  const [linkUsage, setLinkUsage] = useState<{
    remaining: number | null;
    used: number;
    limit: number | null;
  } | null>(null);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    getUserPlan()
      .then(setCurrentPlan)
      .catch(() => setCurrentPlan("free"));
    getRemainingLinks(workspaceId)
      .then(setLinkUsage)
      .catch(() => setLinkUsage(null));
  }, [workspaceId]);

  const planConfig = PLANS[currentPlan];
  const upgradeSuggestion = getUpgradeSuggestion(currentPlan, "links");

  const getProgressColor = () => {
    if (!linkUsage?.limit) return "bg-blue-600";
    const usagePercent = (linkUsage.used / linkUsage.limit) * 100;
    if (usagePercent >= 90) return "bg-red-500";
    if (usagePercent >= 75) return "bg-orange-500";
    if (usagePercent >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (!linkUsage) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse bg-slate-200 rounded" />
        <div className="h-64 animate-pulse bg-slate-100 rounded-lg" />
      </div>
    );
  }

  return (
    <>
      <UsageDetailsModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        linkUsage={linkUsage}
        planFeatures={planConfig.features}
        planName={planConfig.name}
      />
      <ErrorBoundary>
        <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your subscription and billing information.
          </p>
        </div>

        {/* Current Plan - Shortened */}
        <Card
          className="
         gap-2"
        >
          <CardHeader className="">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between ">
              <div className="flex items-center ">
                <CardTitle className="text-base">Current Plan</CardTitle>
                <PlanBadge plan={currentPlan} />
              </div>
              {currentPlan !== "free" && (
                <Badge variant="outline" className="text-xs w-fit">
                  Next billing: {formatDate(getNextBillingDate())}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {/* Glance Usage */}
            {linkUsage.limit !== null && (
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">Monthly Links</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {linkUsage.used} / {linkUsage.limit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                  <div
                    className={cn("h-1.5 rounded-full transition-all", getProgressColor())}
                    style={{
                      width: `${Math.min(100, (linkUsage.used / linkUsage.limit) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    {linkUsage.remaining === 0 ? (
                      <span className="text-red-600 font-medium">Limit reached</span>
                    ) : (
                      <span>{linkUsage.remaining} remaining</span>
                    )}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2 py-0"
                    onClick={() => setUsageModalOpen(true)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200">
              {currentPlan === "free" && upgradeSuggestion && (
                <UpgradeButton
                  currentPlan={currentPlan}
                  targetPlan={upgradeSuggestion}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-8 px-4"
                >
                  Upgrade to {PLANS[upgradeSuggestion].name}
                </UpgradeButton>
              )}
              {currentPlan !== "free" && (
                <>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                    Change Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Available Plans</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the plan that fits your needs. You can upgrade or downgrade at any time.
                </p>
              </div>
              {/* Billing Period Toggle */}
              <div className="flex items-center">
              <Tabs
                value={billingPeriod}
                onValueChange={(v) => {
                  startTransition(() => {
                    setBillingPeriod(v as "monthly" | "yearly");
                  });
                }}
                className="w-auto"
              >
                  <TabsList className="inline-flex h-10 bg-slate-100 p-1 rounded-lg w-auto">
                    <TabsTrigger
                      value="monthly"
                      className="text-sm font-medium rounded-md px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:text-slate-700"
                    >
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger
                      value="yearly"
                      className="text-sm font-medium rounded-md px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:text-slate-700"
                    >
                      Yearly (Save 16%)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {Object.entries(PLANS)
              .filter(([tier]) => tier !== "organization")
              .map(([tier, plan]) => {
                const isCurrentPlan = tier === currentPlan;
                const isRecommended = tier === upgradeSuggestion;

                return (
                  <BillingPlanCard
                    key={tier}
                    tier={tier as PlanTier}
                    plan={plan}
                    isCurrentPlan={isCurrentPlan}
                    isRecommended={isRecommended}
                    currentPlan={currentPlan}
                    billingPeriod={billingPeriod}
                  />
                );
              })}
          </div>
        </div>

        {/* Payment Method */}
        {currentPlan !== "free" && (
          <Suspense fallback={<div className="h-48 animate-pulse bg-slate-100 rounded-lg" />}>
            <PaymentMethod />
          </Suspense>
        )}

        {/* Billing History */}
        {currentPlan !== "free" && (
          <Suspense fallback={<div className="h-48 animate-pulse bg-slate-100 rounded-lg" />}>
            <BillingHistory />
          </Suspense>
        )}
        </div>
      </ErrorBoundary>
    </>
  );
};

export default BillingPage;
