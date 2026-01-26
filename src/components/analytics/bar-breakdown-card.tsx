"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BarBreakdownCardProps {
  title: string;
  description: string;
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  className?: string;
}

export const BarBreakdownCard = ({
  title,
  description,
  data,
  color = "#3b82f6",
  height = 250,
  className = "col-span-full lg:col-span-2",
}: BarBreakdownCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                minTickGap={10}
                stroke="#888888"
                fontSize={11}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
