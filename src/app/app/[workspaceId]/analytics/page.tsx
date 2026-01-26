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

const AnalyticsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await params;
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
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-20 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workspace Analytics</h1>
        <p className="text-muted-foreground">
          Deep dive into your link performance and global audience.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <ClickTrendChart data={trendData} />
        <DeviceBreakdown
          data={deviceData.length > 0 ? deviceData : [{ name: "No data", value: 1 }]}
        />
      </div>

      {/* Geographic Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <ContinentBreakdown
          data={continentData.length > 0 ? continentData : [{ name: "No data", value: 1 }]}
        />
        <CountryBreakdown
          data={countryData.length > 0 ? countryData : [{ name: "No data", value: 1 }]}
        />
      </div>

      {/* Tech Breakdown Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <BrowserBreakdown
          data={browserData.length > 0 ? browserData : [{ name: "No data", value: 1 }]}
        />
        <OSBreakdown data={osData.length > 0 ? osData : [{ name: "No data", value: 1 }]} />
      </div>

      {/* Referral & City Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ReferrerList data={referrerData} />
        <CityList data={cityData} />
      </div>

      {/* Top Links */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Top Performing Links</CardTitle>
          <CardDescription>Targeted content performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {topLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between group">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    /{link.shortCode}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{link.longUrl}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-slate-900">{link.clickCount} clicks</span>
                  <Link href={`/app/${workspaceId}/links`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                      <LinkIcon className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
