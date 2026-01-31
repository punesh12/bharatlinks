"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type PlanTier, type PlanConfig } from "@/lib/plans";
import { Check, Crown, Zap, Building2 } from "lucide-react";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { cn } from "@/lib/utils";

interface BillingPlanCardProps {
  tier: PlanTier;
  plan: PlanConfig;
  isCurrentPlan: boolean;
  isRecommended: boolean;
  currentPlan: PlanTier;
  billingPeriod?: "monthly" | "yearly";
}

const getPlanIcon = (tier: PlanTier) => {
  switch (tier) {
    case "starter":
      return <Zap className="h-5 w-5" />;
    case "pro":
      return <Crown className="h-5 w-5" />;
    case "organization":
      return <Building2 className="h-5 w-5" />;
    default:
      return null;
  }
};

export function BillingPlanCard({
  tier,
  plan,
  isCurrentPlan,
  isRecommended,
  currentPlan,
  billingPeriod = "monthly",
}: BillingPlanCardProps) {
  const monthlyPrice = plan.price.monthly;
  const yearlyPrice = plan.price.yearly;
  const pricePerMonth =
    billingPeriod === "yearly" && yearlyPrice > 0 ? Math.round(yearlyPrice / 12) : monthlyPrice;
  return (
    <Card
      className={cn(
        "relative flex flex-col h-full transition-all hover:shadow-md",
        isCurrentPlan && "border-blue-500 border-2 shadow-sm",
        isRecommended && !isCurrentPlan && "border-yellow-400 border-2 shadow-md",
        !isCurrentPlan && !isRecommended && "hover:border-slate-300"
      )}
    >
      {isRecommended && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-yellow-500 text-white text-xs px-3 py-0.5">Recommended</Badge>
        </div>
      )}
      <CardHeader className={cn("pb-4", isRecommended && !isCurrentPlan && "pt-6")}>
        {/* Plan Title, Icon, and Badge - Aligned */}
        <div className="flex items-start justify-between gap-3 mb-3 min-h-[48px]">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {getPlanIcon(tier) && (
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0",
                  tier === "starter" && "bg-yellow-100 text-yellow-600",
                  tier === "pro" && "bg-purple-100 text-purple-600",
                  tier === "organization" && "bg-blue-100 text-blue-600"
                )}
              >
                {getPlanIcon(tier)}
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold text-slate-900 leading-tight">
                {plan.name}
              </CardTitle>
            </div>
          </div>
          {isCurrentPlan && (
            <Badge variant="default" className="text-xs bg-blue-600 shrink-0 ml-2">
              Current
            </Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">₹{pricePerMonth}</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          {billingPeriod === "yearly" && yearlyPrice > 0 && (
            <>
              <div className="flex items-center gap-2">
                <CardDescription className="text-xs line-through text-slate-400">
                  ₹{monthlyPrice}/month
                </CardDescription>
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  Save 16%
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-600">
                Billed ₹{yearlyPrice} annually
              </CardDescription>
            </>
          )}
          {billingPeriod === "monthly" && yearlyPrice > 0 && (
            <CardDescription className="text-xs text-slate-600">
              or ₹{yearlyPrice}/year (save 16%)
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        {/* Features List */}
        <div className="flex-1 mb-4">
          <ul className="space-y-2.5">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button - Aligned at bottom */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          {!isCurrentPlan && (
            <UpgradeButton
              currentPlan={currentPlan}
              targetPlan={tier}
              className={cn(
                "w-full font-medium",
                isRecommended
                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                  : "border-slate-300 hover:bg-slate-50"
              )}
            >
              {isRecommended ? "Upgrade Now" : "Select Plan"}
            </UpgradeButton>
          )}
          {isCurrentPlan && (
            <Button className="w-full" variant="outline" disabled>
              Current Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
