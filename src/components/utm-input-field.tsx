"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface UtmInputFieldProps {
  icon: LucideIcon;
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const UtmInputField = ({
  icon: Icon,
  label,
  id,
  value,
  onChange,
  placeholder,
}: UtmInputFieldProps) => {
  return (
    <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-r border-slate-300 w-[120px] shrink-0">
        <Icon className="h-4 w-4 text-slate-600" />
        <Label htmlFor={id} className="text-sm font-medium text-slate-700 m-0 cursor-pointer">
          {label}
        </Label>
      </div>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};
