"use client";

import { Modal } from "@/components/ui/modal";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, getNextResetDate } from "@/lib/utils/date";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm:max-w-lg"
      title="Usage Details"
      description={`Detailed breakdown of your ${planName} plan usage.`}
    >
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
                <span>Resets {formatDate(getNextResetDate())}</span>
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
    </Modal>
  );
}
