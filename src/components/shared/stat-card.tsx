"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Link as LinkIcon, Globe, MapPin } from "lucide-react";

const iconMap = {
  barChart: BarChart,
  link: LinkIcon,
  globe: Globe,
  mapPin: MapPin,
};

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: keyof typeof iconMap;
  iconColor?: string;
}

export const StatCard = ({
  title,
  value,
  description,
  icon,
  iconColor = "text-blue-600",
}: StatCardProps) => {
  const Icon = iconMap[icon];
  
  // Map icon colors to background colors
  const bgColorMap: Record<string, string> = {
    "text-blue-600": "bg-blue-50",
    "text-indigo-600": "bg-indigo-50",
    "text-purple-600": "bg-purple-50",
    "text-green-600": "bg-green-50",
  };
  const bgColor = bgColorMap[iconColor] || "bg-slate-50";

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <p className="text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
};
