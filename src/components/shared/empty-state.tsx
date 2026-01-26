"use client";

import { Link as LinkIcon, Search, FileX } from "lucide-react";

const iconMap = {
  link: LinkIcon,
  search: Search,
  fileX: FileX,
};

interface EmptyStateProps {
  title: string;
  description: string;
  icon: keyof typeof iconMap;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-sm w-full mt-10">
      <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-600">
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-8 font-medium">{description}</p>
      {action}
    </div>
  );
};
