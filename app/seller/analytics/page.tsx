"use client";

import { useEffect, useState, useMemo } from "react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { StatsCard } from "@/components/common/stats-card";
import { TrendingUp, Eye, MousePointerClick } from "lucide-react";
import { getListingViewStats, listSellerListings } from "@/lib/api-client";
import { Listing } from "@/lib/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

export default function SellerAnalyticsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [seriesByDay, setSeriesByDay] = useState<{ name: string; views: number }[]>([]);
  const [viewsByListing, setViewsByListing] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await listSellerListings();
        if (!mounted) return;
        setListings(data);

        const to = new Date();
        const from = new Date(to);
        from.setDate(from.getDate() - 7);

        const settled = await Promise.allSettled(
          data.map(async (listing) => {
            const stats = await getListingViewStats(listing.id, {
              accuracy: "DAY",
              from: from.toISOString(),
              to: to.toISOString(),
            });
            return { listingId: listing.id, title: listing.title, stats };
          }),
        );

        if (!mounted) return;

        const dailyAccumulator = new Map<string, number>();
        const listingAccumulator: Record<string, number> = {};

        settled.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { listingId, stats } = result.value;
          listingAccumulator[listingId] = stats.totalViews || 0;

          stats.data?.forEach((point) => {
            const dayKey = point.bucket.slice(0, 10);
            dailyAccumulator.set(dayKey, (dailyAccumulator.get(dayKey) || 0) + point.views);
          });
        });

        const chartData = Array.from(dailyAccumulator.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([day, views]) => ({
            name: new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            views,
          }));

        setViewsByListing(listingAccumulator);
        setSeriesByDay(chartData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalViews = Object.values(viewsByListing).reduce((acc, curr) => acc + curr, 0);
    const avgViews = listings.length > 0 ? Math.round(totalViews / listings.length) : 0;

    return { totalViews, avgViews };
  }, [listings, viewsByListing]);

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />
      <main className="ml-60 pt-6">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Performance metrics for your property listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={<Eye className="h-5 w-5" />}
              variant="info"
            />
            <StatsCard
              title="Avg Views per Listing"
              value={stats.avgViews}
              icon={<TrendingUp className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Click-Through Rate"
              value={loading ? "..." : "N/A"}
              icon={<MousePointerClick className="h-5 w-5" />}
              variant="warning"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="text-lg font-semibold mb-6">Views Over Time (Last 7 Days)</h3>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seriesByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-card">
              <h3 className="text-lg font-semibold mb-6">Listing Performance Comparison</h3>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listings.slice(0, 5).map((l) => ({ name: l.title.substring(0, 10) + "...", views: viewsByListing[l.id] ?? l.views ?? 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                    <Bar dataKey="views" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
