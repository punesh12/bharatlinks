"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PieBreakdownCard } from "./pie-breakdown-card";

export const ClickTrendChart = ({ data }: { data: { date: string; clicks: number }[] }) => {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>Click Trends</CardTitle>
        <CardDescription>Clicks over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClicks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const DeviceBreakdown = ({ data }: { data: { name: string; value: number }[] }) => (
  <PieBreakdownCard
    title="Device Distribution"
    description="Phone, Tablet, Desktop"
    data={data}
    className="col-span-full lg:col-span-1"
    layout="horizontal"
    height={300}
  />
);

export const BrowserBreakdown = ({ data }: { data: { name: string; value: number }[] }) => (
  <PieBreakdownCard
    title="Browser Usage"
    description="Chrome, Safari, Firefox, etc."
    data={data}
    colorOffset={2}
  />
);

export const OSBreakdown = ({ data }: { data: { name: string; value: number }[] }) => (
  <PieBreakdownCard
    title="Operating Systems"
    description="Windows, macOS, Android, iOS"
    data={data}
    colorOffset={4}
  />
);

export const ContinentBreakdown = ({ data }: { data: { name: string; value: number }[] }) => (
  <PieBreakdownCard
    title="Continents"
    description="Global Traffic Split"
    data={data}
    colorOffset={6}
  />
);

export const CountryBreakdown = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Countries</CardTitle>
        <CardDescription>Visitor locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
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
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReferrerList = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Top Referrers</CardTitle>
        <CardDescription>Where your traffic is linked from</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 truncate max-w-[300px]">
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(item.value / Math.max(...data.map((d) => d.value))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-10 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No referrer data yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const CityList = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Top Cities</CardTitle>
        <CardDescription>Detailed visitor hubs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{item.value} visits</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No city data yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
