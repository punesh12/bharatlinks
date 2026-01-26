"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanTier, getUpgradeSuggestion } from "@/lib/plans";
import { PlanBadge } from "@/components/plan-badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { UsageDetailsModal } from "@/components/settings/usage-details-modal";
import { getUserPlan, getRemainingLinks } from "@/lib/utils/plans";
import { useParams } from "next/navigation";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { BillingPlanCard } from "@/components/settings/billing-plan-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BillingPage = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [currentPlan, setCurrentPlan] = React.useState<PlanTier>("free");
  const [linkUsage, setLinkUsage] = React.useState<{
    remaining: number | null;
    used: number;
    limit: number | null;
  } | null>(null);
  const [usageModalOpen, setUsageModalOpen] = React.useState(false);
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "yearly">("monthly");

  React.useEffect(() => {
    getUserPlan().then(setCurrentPlan).catch(() => setCurrentPlan("free"));
    getRemainingLinks(workspaceId)
      .then(setLinkUsage)
      .catch(() => setLinkUsage(null));
  }, [workspaceId]);

  if (!linkUsage) {
    return <div>Loading...</div>;
  }

  const planConfig = PLANS[currentPlan];
  const upgradeSuggestion = getUpgradeSuggestion(currentPlan, "links");

  const getNextBillingDate = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  };

  const getProgressColor = () => {
    if (!linkUsage.limit) return "bg-blue-600";
    const usagePercent = (linkUsage.used / linkUsage.limit) * 100;
    if (usagePercent >= 90) return "bg-red-500";
    if (usagePercent >= 75) return "bg-orange-500";
    if (usagePercent >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <UsageDetailsModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        linkUsage={linkUsage}
        planFeatures={planConfig.features}
        planName={planConfig.name}
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your subscription and billing information.
          </p>
        </div>

        {/* Current Plan - Shortened */}
        <Card className="
         gap-2">
          <CardHeader className="">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between ">
              <div className="flex items-center ">
                <CardTitle className="text-base">Current Plan</CardTitle>
                <PlanBadge plan={currentPlan} />
              </div>
              {currentPlan !== "free" && (
                <Badge variant="outline" className="text-xs w-fit">
                  Next billing: {format(getNextBillingDate(), "MMM d, yyyy")}
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
                  onValueChange={(v) => setBillingPeriod(v as "monthly" | "yearly")}
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
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">••••</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Card ending in •••• 4242</p>
                    <p className="text-xs text-slate-600 mt-0.5">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Update Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        {currentPlan !== "free" && (
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">No billing history</p>
                <p className="text-xs text-slate-500">Your invoices will appear here once you make your first payment.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default BillingPage;
