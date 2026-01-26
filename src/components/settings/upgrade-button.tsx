"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { type PlanTier, PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface UpgradeButtonProps {
  currentPlan: PlanTier;
  targetPlan: PlanTier;
  className?: string;
  children?: React.ReactNode;
}

export function UpgradeButton({
  currentPlan,
  targetPlan,
  className,
  children,
}: UpgradeButtonProps) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const targetPlanConfig = PLANS[targetPlan];
  const billingUrl = `/app/${workspaceId}/settings/billing`;

  return (
    <Link href={billingUrl}>
      <Button
        className={cn(className)}
        variant={children ? undefined : "outline"}
      >
        {children || `Upgrade to ${targetPlanConfig.name}`}
      </Button>
    </Link>
  );
}
