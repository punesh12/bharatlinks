"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Building2 } from "lucide-react";
import { PLANS, type PlanTier, getUpgradeSuggestion } from "@/lib/plans";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  reason?: string;
  limit?: number;
  currentCount?: number;
}

export const UpgradeModal = ({
  isOpen,
  onClose,
  currentPlan,
  reason,
  limit,
  currentCount,
}: UpgradeModalProps) => {
  const suggestedPlan = getUpgradeSuggestion(currentPlan, "links");

  const getPlanIcon = (tier: PlanTier) => {
    switch (tier) {
      case "free":
        return null;
      case "starter":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "pro":
        return <Crown className="h-5 w-5 text-purple-500" />;
      case "organization":
        return <Building2 className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            {reason || "Unlock more features and higher limits"}
          </DialogDescription>
        </DialogHeader>

        {limit && currentCount !== undefined && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Monthly Links Used</span>
              <span className="text-sm text-slate-600">
                {currentCount} / {limit}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentCount / limit) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(PLANS)
            .filter(([tier]) => {
              // Show current plan and higher tiers
              const tierOrder: PlanTier[] = ["free", "starter", "pro", "organization"];
              const currentIndex = tierOrder.indexOf(currentPlan);
              const tierIndex = tierOrder.indexOf(tier as PlanTier);
              return tierIndex >= currentIndex;
            })
            .map(([tier, plan]) => {
              const isCurrent = tier === currentPlan;
              const isSuggested = tier === suggestedPlan;

              return (
                <div
                  key={tier}
                  className={`border rounded-lg p-4 ${
                    isCurrent
                      ? "border-blue-300 bg-blue-50"
                      : isSuggested
                        ? "border-purple-300 bg-purple-50"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(tier as PlanTier)}
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      {isCurrent && (
                        <Badge variant="outline" className="ml-2">
                          Current
                        </Badge>
                      )}
                      {isSuggested && (
                        <Badge className="ml-2 bg-purple-600">Recommended</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ₹{plan.price.monthly}
                        <span className="text-sm font-normal text-slate-500">/mo</span>
                      </div>
                      {plan.price.yearly > 0 && (
                        <div className="text-xs text-slate-500">
                          or ₹{plan.price.yearly}/year
                        </div>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        isSuggested ? "bg-purple-600 hover:bg-purple-700" : ""
                      }`}
                      onClick={() => {
                        // TODO: Integrate with payment gateway (Razorpay/Stripe)
                        window.open("/app/settings?tab=billing", "_blank");
                      }}
                    >
                      {plan.price.monthly === 0 ? "Continue" : "Upgrade"}
                    </Button>
                  )}
                </div>
              );
            })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
