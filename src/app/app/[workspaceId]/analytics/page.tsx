import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import dynamic from "next/dynamic";

const ClickTrendChart = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.ClickTrendChart)
);
const DeviceBreakdown = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.DeviceBreakdown)
);
const BrowserBreakdown = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.BrowserBreakdown)
);
const OSBreakdown = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.OSBreakdown)
);
const ReferrerList = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.ReferrerList)
);
const ContinentBreakdown = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.ContinentBreakdown)
);
const CountryBreakdown = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.CountryBreakdown)
);
const CityList = dynamic(() =>
  import("@/components/analytics/chart-cards").then((m) => m.CityList)
);

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAnalyticsData } from "@/lib/services/analytics";
import { Suspense } from "react";

const AnalyticsContent = async ({ workspaceId }: { workspaceId: string }) => {
  const {
    stats,
    trendData,
    deviceData,
    browserData,
    osData,
    continentData,
    countryData,
    cityData,
    referrerData,
    topLinks,
  } = await getAnalyticsData(workspaceId);

  return (
    <>
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total Clicks"
          value={stats?.totalClicks || 0}
          description="Life-time engagement"
          icon="barChart"
        />
        <StatCard
          title="Active Links"
          value={stats?.totalLinks || 0}
          description="Short URLs created"
          icon="link"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Main Trend & Device Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <ClickTrendChart data={trendData} />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <DeviceBreakdown
            data={deviceData.length > 0 ? deviceData : [{ name: "No data", value: 1 }]}
          />
        </Suspense>
      </div>

      {/* Geographic Row - Continents, Countries, Cities */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <ContinentBreakdown
            data={continentData.length > 0 ? continentData : [{ name: "No data", value: 1 }]}
          />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <CountryBreakdown
            data={countryData.length > 0 ? countryData : [{ name: "No data", value: 1 }]}
          />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <CityList data={cityData} />
        </Suspense>
      </div>

      {/* Tech Breakdown Row - Browser, OS, Referrers */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <BrowserBreakdown
            data={browserData.length > 0 ? browserData : [{ name: "No data", value: 1 }]}
          />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <OSBreakdown data={osData.length > 0 ? osData : [{ name: "No data", value: 1 }]} />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-lg" />}>
          <ReferrerList data={referrerData} />
        </Suspense>
      </div>

      {/* Top Links */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Performing Links</CardTitle>
          <CardDescription className="text-xs">Targeted content performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topLinks.length > 0 ? (
              topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold shrink-0">
                      {index + 1}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        /{link.shortCode}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{link.longUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900">{link.clickCount}</span>
                      <span className="text-xs text-slate-500 ml-1">clicks</span>
                    </div>
                    <Link href={`/app/${workspaceId}/links`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No link data available yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const AnalyticsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await params;

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Analytics</h1>
        <p className="text-sm text-slate-600">
          Deep dive into your link performance and global audience.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-24 animate-pulse bg-slate-100 rounded-lg" />
              <div className="h-24 animate-pulse bg-slate-100 rounded-lg" />
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse bg-slate-100 rounded-lg" />
              ))}
            </div>
          </div>
        }
      >
        <AnalyticsContent workspaceId={workspaceId} />
      </Suspense>
    </div>
  );
};

export default AnalyticsPage;
