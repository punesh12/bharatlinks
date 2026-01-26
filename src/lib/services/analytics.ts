import { db } from "@/db";
import { links, analytics } from "@/db/schema";
import { eq, sum, count, desc, sql, gte, and } from "drizzle-orm";
import { format, subDays } from "date-fns";

export const getAnalyticsData = async (workspaceId: string) => {
  // 1. Core Stats
  const [stats] = await db
    .select({
      totalClicks: sum(links.clickCount),
      totalLinks: count(links.id),
    })
    .from(links)
    .where(eq(links.workspaceId, workspaceId));

  // 2. Click Trend (Last 7 Days)
  const sevenDaysAgo = subDays(new Date(), 7);
  const trendDataRaw = await db
    .select({
      day: sql<string>`DATE(${analytics.timestamp})`,
      clicks: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(and(eq(links.workspaceId, workspaceId), gte(analytics.timestamp, sevenDaysAgo)))
    .groupBy(sql`DATE(${analytics.timestamp})`)
    .orderBy(sql`DATE(${analytics.timestamp})`);

  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const dateStr = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const found = trendDataRaw.find((d) => d.day === dateStr);
    return {
      date: format(subDays(new Date(), 6 - i), "MMM dd"),
      clicks: found ? Number(found.clicks) : 0,
    };
  });

  // 3. Device Breakdown
  const deviceDataRaw = await db
    .select({
      device: sql<string>`LOWER(${analytics.device})`,
      count: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(eq(links.workspaceId, workspaceId))
    .groupBy(sql`LOWER(${analytics.device})`);

  const deviceData = deviceDataRaw.map((d) => {
    const type = (d.device || "desktop").toLowerCase();
    const labelMap: Record<string, string> = {
      phone: "Phone",
      mobile: "Phone",
      tablet: "Tablet",
      desktop: "Desktop",
    };
    return {
      name: labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
      value: Number(d.count),
    };
  });

  // 4. Browser Breakdown
  const browserDataRaw = await db
    .select({
      browser: sql<string>`LOWER(${analytics.browser})`,
      count: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(eq(links.workspaceId, workspaceId))
    .groupBy(sql`LOWER(${analytics.browser})`);

  const browserData = browserDataRaw.map((d) => {
    const name = (d.browser || "unknown").toLowerCase();
    const labelMap: Record<string, string> = {
      chrome: "Chrome",
      safari: "Safari",
      firefox: "Firefox",
      edge: "Edge",
      opera: "Opera",
      ie: "Internet Explorer",
    };
    return {
      name: labelMap[name] || name.charAt(0).toUpperCase() + name.slice(1),
      value: Number(d.count),
    };
  });

  // 5. OS Breakdown
  const osDataRaw = await db
    .select({
      os: sql<string>`LOWER(${analytics.os})`,
      count: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(eq(links.workspaceId, workspaceId))
    .groupBy(sql`LOWER(${analytics.os})`);

  const osData = osDataRaw.map((d) => ({
    name:
      d.os === "macos"
        ? "macOS"
        : d.os === "ios"
          ? "iOS"
          : (d.os || "unknown").charAt(0).toUpperCase() + (d.os || "unknown").slice(1),
    value: Number(d.count),
  }));

  // 6. Geography: Continents
  const continentDataRaw = await db
    .select({
      continent: analytics.continent,
      count: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(eq(links.workspaceId, workspaceId))
    .groupBy(analytics.continent);

  const continentData = continentDataRaw.map((d) => ({
    name: d.continent && d.continent !== "Unknown" ? d.continent : "Other / Unknown",
    value: Number(d.count),
  }));

  // 7. Geography: Countries
  const countryDataRaw = await db
    .select({
      country: analytics.country,
      count: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(eq(links.workspaceId, workspaceId))
    .groupBy(analytics.country)
    .orderBy(desc(count(analytics.id)))
    .limit(10);

  const countryData = countryDataRaw.map((d) => ({
    name: d.country && d.country !== "Unknown" ? d.country : "Unknown",
    value: Number(d.count),
  }));

  // 8. Geography: Cities
  const cityDataRaw = await db
    .select({
      city: analytics.city,
      count: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(eq(links.workspaceId, workspaceId))
    .groupBy(analytics.city)
    .orderBy(desc(count(analytics.id)))
    .limit(10);

  const cityData = cityDataRaw.map((d) => ({
    name: d.city && d.city !== "Unknown" ? d.city : "Unknown Location",
    value: Number(d.count),
  }));

  // 9. Referrer List
  const referrerDataRaw = await db
    .select({
      referrer: analytics.referrer,
      count: count(analytics.id),
    })
    .from(analytics)
    .innerJoin(links, eq(analytics.linkId, links.id))
    .where(eq(links.workspaceId, workspaceId))
    .groupBy(analytics.referrer)
    .orderBy(desc(count(analytics.id)))
    .limit(10);

  const referrerData = referrerDataRaw.map((d) => {
    try {
      return {
        name:
          d.referrer && d.referrer !== "Direct"
            ? new URL(d.referrer).hostname
            : "Direct / Social Media",
        value: Number(d.count),
      };
    } catch {
      return {
        name: d.referrer || "Direct",
        value: Number(d.count),
      };
    }
  });

  // 10. Top Links
  const topLinks = await db
    .select()
    .from(links)
    .where(eq(links.workspaceId, workspaceId))
    .orderBy(desc(links.clickCount))
    .limit(5);

  return {
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
  };
};
