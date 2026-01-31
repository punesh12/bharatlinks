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
import { BarChart as BarChartIcon, MapPin } from "lucide-react";

export const ClickTrendChart = ({ data }: { data: { date: string; clicks: number }[] }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.clicks > 0);
  
  return (
    <Card className="col-span-full lg:col-span-2 border-slate-200 shadow-sm">
      <CardHeader className="pb-1.5">
        <CardTitle className="text-base font-semibold">Click Trends</CardTitle>
        <CardDescription className="text-xs">Clicks over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="pt-1.5 px-3">
        {hasData ? (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[260px] w-full flex items-center justify-center">
            <div className="text-center">
              <BarChart className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No click data available</p>
              <p className="text-xs text-slate-400 mt-1">Data will appear as links are clicked</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DeviceBreakdown = ({ data }: { data: { name: string; value: number }[] }) => {
  const hasData = data && data.length > 0 && !data.some((d) => d.name === "No data");
  
  return (
    <PieBreakdownCard
      title="Device Distribution"
      description="Phone, Tablet, Desktop"
      data={hasData ? data : []}
      className="col-span-full lg:col-span-1"
      layout="horizontal"
      height={280}
    />
  );
};

export const BrowserBreakdown = ({ data }: { data: { name: string; value: number }[] }) => {
  const hasData = data && data.length > 0 && !data.some((d) => d.name === "No data");
  
  return (
    <PieBreakdownCard
      title="Browser Usage"
      description="Chrome, Safari, Firefox, etc."
      data={hasData ? data : []}
      colorOffset={2}
      height={280}
      className="col-span-full lg:col-span-1"
    />
  );
};

export const OSBreakdown = ({ data }: { data: { name: string; value: number }[] }) => {
  const hasData = data && data.length > 0 && !data.some((d) => d.name === "No data");
  
  return (
    <PieBreakdownCard
      title="Operating Systems"
      description="Windows, macOS, Android, iOS"
      data={hasData ? data : []}
      colorOffset={4}
      height={280}
      className="col-span-full lg:col-span-1"
    />
  );
};

export const ContinentBreakdown = ({ data }: { data: { name: string; value: number }[] }) => {
  const hasData = data && data.length > 0 && !data.some((d) => d.name === "No data");
  
  return (
    <PieBreakdownCard
      title="Continents"
      description="Global Traffic Split"
      data={hasData ? data : []}
      colorOffset={6}
      height={280}
      className="col-span-full lg:col-span-1"
    />
  );
};

export const CountryBreakdown = ({ data }: { data: { name: string; value: number }[] }) => {
  const hasData = data && data.length > 0 && !data.some((d) => d.name === "No data");
  const displayData = hasData ? data.slice(0, 5) : [];
  
  return (
    <Card className="col-span-full lg:col-span-1 border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top Countries</CardTitle>
        <CardDescription className="text-xs">Visitor locations</CardDescription>
      </CardHeader>
      <CardContent className="pt-1.5 px-3">
        {hasData && displayData.length > 0 ? (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  minTickGap={6}
                  stroke="#94a3b8"
                  fontSize={10}
                  width={65}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[260px] w-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No country data available</p>
              <p className="text-xs text-slate-400 mt-1">Geographic data will appear here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ReferrerList = ({ data }: { data: { name: string; value: number }[] }) => {
  const hasData = data && data.length > 0;
  const maxValue = hasData ? Math.max(...data.map((d) => d.value)) : 1;
  
  return (
    <Card className="col-span-full lg:col-span-1 border-slate-200 shadow-sm">
      <CardHeader className="pb-1.5">
        <CardTitle className="text-base font-semibold">Top Referrers</CardTitle>
        <CardDescription className="text-xs">Where your traffic is linked from</CardDescription>
      </CardHeader>
      <CardContent className="pt-1.5 px-3">
        {hasData ? (
          <div className="space-y-2.5 h-[260px] flex flex-col justify-start">
            {data.slice(0, 5).map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-700 truncate flex-1">
                    {item.name || "Direct / Social Media"}
                  </span>
                  <span className="text-xs font-bold text-slate-900 shrink-0">
                    {item.value}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[260px] flex items-center justify-center">
            <div className="text-center">
              <BarChartIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No referrer data yet</p>
              <p className="text-xs text-slate-400 mt-1">Referrer data will appear here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const CityList = ({ data }: { data: { name: string; value: number }[] }) => {
  const hasData = data && data.length > 0;
  
  return (
    <Card className="col-span-full lg:col-span-1 border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top Cities</CardTitle>
        <CardDescription className="text-xs">Detailed visitor hubs</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {data.slice(0, 6).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {item.name || "Unknown Location"}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900 shrink-0 ml-2">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No city data yet</p>
            <p className="text-xs text-slate-400 mt-1">City data will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
