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
  colorOffset = 0,
  height = 250,
  className = "col-span-full lg:col-span-2",
  layout = "vertical",
}: PieBreakdownCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={height * 0.2}
                outerRadius={height * 0.28}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[(index + colorOffset) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                align={layout === "vertical" ? "right" : "center"}
                layout={layout}
                width={layout === "vertical" ? 120 : undefined}
                verticalAlign={layout === "vertical" ? "middle" : "bottom"}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
