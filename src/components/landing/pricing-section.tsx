"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANS, type PlanTier } from "@/lib/plans";
import { Check, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const getPlanIcon = (tier: PlanTier) => {
  switch (tier) {
    case "starter":
      return <Zap className="h-5 w-5" />;
    case "pro":
      return <Crown className="h-5 w-5" />;
    default:
      return null;
  }
};

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plansToShow: PlanTier[] = ["free", "starter", "pro"];

  return (
    <section id="pricing" className="w-full py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Start free, upgrade as you grow. No hidden fees.
          </p>
          
          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center mt-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plansToShow.map((tier) => {
            const plan = PLANS[tier];
            const monthlyPrice = plan.price.monthly;
            const yearlyPrice = plan.price.yearly;
            const pricePerMonth = billingPeriod === "yearly" && yearlyPrice > 0 
              ? Math.round(yearlyPrice / 12) 
              : monthlyPrice;
            const isRecommended = tier === "starter";

            return (
              <Card
                key={tier}
                className={cn(
                  "relative flex flex-col h-full transition-all hover:shadow-lg",
                  isRecommended && "border-yellow-400 border-2 shadow-md scale-105"
                )}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-white text-xs px-3 py-0.5">
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className={cn("pb-4", isRecommended && "pt-6")}>
                  {/* Plan Title and Icon */}
                  <div className="flex items-center gap-2.5 mb-3">
                    {getPlanIcon(tier) && (
                      <div className={cn(
                        "p-2 rounded-lg",
                        tier === "starter" && "bg-yellow-100 text-yellow-600",
                        tier === "pro" && "bg-purple-100 text-purple-600"
                      )}>
                        {getPlanIcon(tier)}
                      </div>
                    )}
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      {plan.name}
                    </CardTitle>
                  </div>
                  
                  {/* Pricing */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        ₹{pricePerMonth}
                      </span>
                      {tier !== "free" && (
                        <span className="text-sm text-muted-foreground">/month</span>
                      )}
                    </div>
                    {billingPeriod === "yearly" && yearlyPrice > 0 && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs line-through text-slate-400">
                            ₹{monthlyPrice}/month
                          </span>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Save 16%
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          Billed ₹{yearlyPrice} annually
                        </p>
                      </>
                    )}
                    {billingPeriod === "monthly" && yearlyPrice > 0 && (
                      <p className="text-xs text-slate-600">
                        or ₹{yearlyPrice}/year (save 16%)
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col pt-0">
                  {/* Features List */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <Link href="/sign-up" className="block">
                      <Button
                        className={cn(
                          "w-full font-medium",
                          tier === "free" && "bg-slate-900 hover:bg-slate-800 text-white",
                          isRecommended && "bg-yellow-500 hover:bg-yellow-600 text-white",
                          tier === "pro" && "border-slate-300 hover:bg-slate-50"
                        )}
                        variant={tier === "pro" ? "outline" : "default"}
                      >
                        {tier === "free" ? "Get Started Free" : "Get Started"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600">
            All plans include 24/7 support and a 14-day money-back guarantee.
          </p>
        </div>
      </div>
    </section>
  );
}
