"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#2563eb",
  "#8b5cf6",
  "#06b6d4",
  "#475569",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#ef4444",
];

// Context-specific color schemes
const getColorForData = (title: string, dataName: string, index: number): string => {
  const normalizedName = dataName.toLowerCase().trim();
  
  // Device Distribution colors
  if (title.toLowerCase().includes("device")) {
    if (normalizedName.includes("phone") || normalizedName.includes("mobile")) {
      return "#3b82f6"; // Blue for mobile
    }
    if (normalizedName.includes("tablet")) {
      return "#8b5cf6"; // Purple for tablet
    }
    if (normalizedName.includes("desktop")) {
      return "#10b981"; // Green for desktop
    }
  }
  
  // Browser Usage colors (brand colors)
  if (title.toLowerCase().includes("browser")) {
    // Check for mobile chrome first (more specific match - must come before regular chrome)
    if (normalizedName.includes("mobile chrome") || normalizedName.includes("chrome mobile") || normalizedName.includes("mobilechrome")) {
      return "#4285f4"; // Chrome blue for mobile
    }
    // Regular Chrome (desktop) - Chrome's brand yellow/orange
    if (normalizedName === "chrome" || (normalizedName.includes("chrome") && !normalizedName.includes("mobile"))) {
      return "#fbbc04"; // Chrome yellow/orange (Google Chrome brand color)
    }
    // Safari
    if (normalizedName.includes("safari")) {
      return "#007aff"; // Safari blue
    }
    // Firefox
    if (normalizedName.includes("firefox")) {
      return "#ff7139"; // Firefox orange
    }
    // Edge
    if (normalizedName.includes("edge")) {
      return "#0078d4"; // Edge blue
    }
    // Opera - Opera's brand red
    if (normalizedName.includes("opera")) {
      return "#ff1b2d"; // Opera red
    }
    // Brave
    if (normalizedName.includes("brave")) {
      return "#fb542b"; // Brave orange
    }
    // Samsung Internet
    if (normalizedName.includes("samsung")) {
      return "#1428a0"; // Samsung Internet blue
    }
    // UC Browser
    if (normalizedName.includes("uc browser") || normalizedName.includes("ucbrowser")) {
      return "#ff6600"; // UC Browser orange
    }
  }
  
  // Operating System colors (brand colors)
  if (title.toLowerCase().includes("operating system") || title.toLowerCase().includes("os")) {
    if (normalizedName.includes("windows")) {
      return "#0078d4"; // Windows blue
    }
    if (normalizedName.includes("macos") || normalizedName.includes("mac os")) {
      return "#a8a8a8"; // macOS gray
    }
    if (normalizedName.includes("android")) {
      return "#3ddc84"; // Android green
    }
    if (normalizedName.includes("ios")) {
      return "#007aff"; // iOS blue
    }
    if (normalizedName.includes("linux")) {
      return "#fcc624"; // Linux yellow/gold
    }
  }
  
  // Continent colors (geographic-inspired)
  if (title.toLowerCase().includes("continent")) {
    if (normalizedName.includes("asia")) {
      return "#ef4444"; // Red for Asia
    }
    if (normalizedName.includes("europe")) {
      return "#3b82f6"; // Blue for Europe
    }
    if (normalizedName.includes("north america") || normalizedName.includes("america")) {
      return "#10b981"; // Green for Americas
    }
    if (normalizedName.includes("south america")) {
      return "#f59e0b"; // Orange for South America
    }
    if (normalizedName.includes("africa")) {
      return "#fbbf24"; // Gold/Yellow for Africa
    }
    if (normalizedName.includes("oceania") || normalizedName.includes("australia")) {
      return "#06b6d4"; // Cyan for Oceania
    }
  }
  
  // Default fallback - use index-based colors
  return COLORS[index % COLORS.length];
};

interface PieBreakdownCardProps {
  title: string;
  description: string;
  data: { name: string; value: number }[];
  colorOffset?: number;
  height?: number;
  className?: string;
  layout?: "vertical" | "horizontal";
}

export const PieBreakdownCard = ({
  title,
  description,
  data,
  colorOffset = 0, // eslint-disable-line @typescript-eslint/no-unused-vars
  height = 250,
  className = "col-span-full lg:col-span-2",
  layout = "vertical",
}: PieBreakdownCardProps) => {
  const hasData = data && data.length > 0 && !data.some((d) => d.name === "No data");
  
  // Calculate chart size - properly center charts
  const availableHeight = height - 50; // Account for header and padding
  
  // Calculate radius based on available space - make charts fill the space properly
  // For 3-column layout, we need to balance chart size with legend space
  // Reduce radius slightly to ensure chart doesn't get cropped
  const baseRadius = Math.min(availableHeight * 0.35, 90);
  const innerRadius = layout === "horizontal" 
    ? baseRadius * 0.45  // Thinner donut for horizontal
    : baseRadius * 0.55;  // Thicker donut for vertical
  const outerRadius = baseRadius;
  
  return (
    <Card className={`${className} border-slate-200 shadow-sm h-full flex flex-col`}>
      <CardHeader className="pb-1.5 flex-shrink-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-1.5 px-4 flex-1 flex items-center justify-center">
        {hasData ? (
          <div style={{ height: `${height - 50}px` }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ right: layout === "vertical" ? 0 : 0, left: layout === "vertical" ? 0 : 0 }}>
                <Pie
                  data={data}
                  cx={layout === "vertical" ? "50%" : "50%"}
                  cy={layout === "vertical" ? "50%" : "45%"}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColorForData(title, item.name, index)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  align={layout === "vertical" ? "right" : "center"}
                  layout={layout}
                  width={layout === "vertical" ? "48%" : undefined}
                  verticalAlign={layout === "vertical" ? "middle" : "bottom"}
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ 
                    fontSize: "11px",
                    lineHeight: "1.6",
                    paddingTop: layout === "horizontal" ? "12px" : "0",
                    paddingLeft: layout === "vertical" ? "15px" : "0"
                  }}
                  formatter={(value: string) => {
                    const maxLen = layout === "vertical" ? 15 : 22;
                    return value.length > maxLen ? `${value.substring(0, maxLen)}...` : value;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: `${height - 50}px` }} className="w-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              </div>
              <p className="text-sm text-slate-500">No data available</p>
              <p className="text-xs text-slate-400 mt-1">Data will appear here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
