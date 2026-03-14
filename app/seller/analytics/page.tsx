"use client";

import { useEffect, useState, useMemo } from "react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { StatsCard } from "@/components/common/stats-card";
import { BarChart3, TrendingUp, Eye, MousePointerClick } from "lucide-react";
import { listSellerListings } from "@/lib/api-client";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSellerListings()
      .then(setListings)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalViews = listings.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const avgViews = listings.length > 0 ? Math.round(totalViews / listings.length) : 0;
    
    // Mocking some data for the chart since real time-series data isn't available from current API
    const chartData = [
      { name: "Mon", views: 400, clicks: 240 },
      { name: "Tue", views: 300, clicks: 139 },
      { name: "Wed", views: 200, clicks: 980 },
      { name: "Thu", views: 278, clicks: 390 },
      { name: "Fri", views: 189, clicks: 480 },
      { name: "Sat", views: 239, clicks: 380 },
      { name: "Sun", views: 349, clicks: 430 },
    ];

    return { totalViews, avgViews, chartData };
  }, [listings]);

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
              value="3.2%"
              icon={<MousePointerClick className="h-5 w-5" />}
              variant="warning"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="text-lg font-semibold mb-6">Views & Clicks Over Time</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="clicks" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-card">
              <h3 className="text-lg font-semibold mb-6">Listing Performance Comparison</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listings.slice(0, 5).map(l => ({ name: l.title.substring(0, 10) + "...", views: l.views }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
