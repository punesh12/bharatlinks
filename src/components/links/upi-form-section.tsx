"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const UPIFormSection = () => {
  return (
    <div className="grid gap-3">
      <input type="hidden" name="longUrl" value="https://bharatlinks.in/upi-redirect" />
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="upiVpa" className="text-xs">
            UPI ID (VPA)
          </Label>
          <Input id="upiVpa" name="upiVpa" placeholder="punesh@okaxis" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="upiName" className="text-xs">
            Merchant Name
          </Label>
          <Input id="upiName" name="upiName" placeholder="Punesh Borkar" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="upiAmount" className="text-xs">
            Amount (Optional)
          </Label>
          <Input id="upiAmount" name="upiAmount" type="number" placeholder="500" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="upiNote" className="text-xs">
            Payment Note
          </Label>
          <Input id="upiNote" name="upiNote" placeholder="Dinner Bill" />
        </div>
      </div>
    </div>
  );
};
