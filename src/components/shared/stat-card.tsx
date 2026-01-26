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

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};
