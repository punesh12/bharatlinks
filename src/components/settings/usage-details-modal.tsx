"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UsageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkUsage: {
    remaining: number | null;
    used: number;
    limit: number | null;
  };
  planFeatures: string[];
  planName: string;
}

export function UsageDetailsModal({
  isOpen,
  onClose,
  linkUsage,
  planFeatures,
  planName,
}: UsageDetailsModalProps) {
  const percentage = linkUsage.limit ? Math.min(100, (linkUsage.used / linkUsage.limit) * 100) : 0;

  const getProgressColor = () => {
    if (!linkUsage.limit) return "bg-blue-600";
    const usagePercent = (linkUsage.used / linkUsage.limit) * 100;
    if (usagePercent >= 90) return "bg-red-500";
    if (usagePercent >= 75) return "bg-orange-500";
    if (usagePercent >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getNextResetDate = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Usage Details</DialogTitle>
          <DialogDescription>Detailed breakdown of your {planName} plan usage.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Monthly Links</span>
              <span className="text-sm font-semibold text-slate-900">
                {linkUsage.used} / {linkUsage.limit || "∞"}
              </span>
            </div>
            {linkUsage.limit && (
              <>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={cn(
                      "h-3 rounded-full transition-all",
                      percentage >= 90
                        ? "bg-red-500"
                        : percentage >= 75
                          ? "bg-orange-500"
                          : percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    {linkUsage.remaining !== null
                      ? `${linkUsage.remaining} links remaining`
                      : "Unlimited"}
                  </span>
                  <span>Resets {format(getNextResetDate(), "MMM d, yyyy")}</span>
                </div>
              </>
            )}
          </div>

          {/* Plan Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Plan Features</h3>
            <div className="grid grid-cols-1 gap-2">
              {planFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
