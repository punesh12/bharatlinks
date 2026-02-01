"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaymentMethodProps {
  className?: string;
  onUpdatePaymentMethod?: () => void;
}

export const PaymentMethod = ({ className, onUpdatePaymentMethod }: PaymentMethodProps) => {
  return (
    <Card className={className}>
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
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={onUpdatePaymentMethod}
          >
            Update Payment Method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
