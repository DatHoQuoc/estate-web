"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  LineChart,
  Plus,
  XCircle,
} from "lucide-react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { StatsCard } from "@/components/common/stats-card";
import { Button } from "@/components/ui/button";
import {
  getSellerDashboardSummary,
  getSellerDashboardViewsSeries,
  getSellerNeedsAttention,
  getSellerRecentListings,
  getSellerTopPerformers,
  type SellerDashboardSummaryResponse,
  type SellerNeedsAttentionItem,
  type SellerRecentListingItem,
  type SellerTopPerformerItem,
} from "@/lib/api-client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


function SellerDashboardContent() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SellerDashboardSummaryResponse | null>(null);
  const [seriesByDay, setSeriesByDay] = useState<{ name: string; views: number }[]>([]);
  const [topPerformers, setTopPerformers] = useState<SellerTopPerformerItem[]>([]);
  const [needsAttention, setNeedsAttention] = useState<SellerNeedsAttentionItem[]>([]);
  const [recentListings, setRecentListings] = useState<SellerRecentListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const to = new Date();
        const from = new Date(to);
        from.setDate(from.getDate() - 7);

        const [summaryData, seriesResponse, topData, attentionData, recentData] = await Promise.all(
          [
            getSellerDashboardSummary(),
            getSellerDashboardViewsSeries({
              accuracy: "DAY",
              from: from.toISOString(),
              to: to.toISOString(),
            }),
            getSellerTopPerformers("7d", 5),
            getSellerNeedsAttention(4),
            getSellerRecentListings(5),
          ],
        );

        if (!mounted) return;

        const chartData = (seriesResponse.data || []).map((point) => ({
          name: new Date(point.bucket).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          views: point.views,
        }));

        setSummary(summaryData);
        setSeriesByDay(chartData);
        setTopPerformers(topData.items || []);
        setNeedsAttention(attentionData.items || []);
        setRecentListings(recentData.items || []);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const listingStats = useMemo(() => {
    return {
      total: summary?.totalListings ?? 0,
      published: summary?.published ?? 0,
      pending: summary?.pendingReview ?? 0,
      rejected: summary?.rejected ?? 0,
      totalViews: summary?.totalViews7d ?? 0,
    };
  }, [summary]);

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />

      <main className="ml-60 pt-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Seller Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Unified overview of portfolio health, visibility, and required actions.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/seller/listings")}>Open My Listings</Button>
              <Button onClick={() => navigate("/seller/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Listing
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatsCard
              title="Total Listings"
              value={listingStats.total}
              icon={<LineChart className="h-5 w-5" />}
            />
            <StatsCard
              title="Published"
              value={listingStats.published}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Pending Review"
              value={listingStats.pending}
              icon={<Clock className="h-5 w-5" />}
              variant="warning"
            />
            <StatsCard
              title="Rejected"
              value={listingStats.rejected}
              icon={<XCircle className="h-5 w-5" />}
              variant="danger"
            />
            <StatsCard
              title="Total Views (7d)"
              value={listingStats.totalViews}
              icon={<Eye className="h-5 w-5" />}
              variant="info"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="text-lg font-semibold mb-4">Portfolio Views Over Time</h3>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={seriesByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-card">
              <h3 className="text-lg font-semibold mb-4">Top Performing Listings</h3>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPerformers}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="title" stroke="var(--muted-foreground)" fontSize={12} />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Needs Attention</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/seller/listings")}>Open all <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </div>
              {needsAttention.length === 0 ? (
                <p className="text-sm text-muted-foreground">No listings need action right now.</p>
              ) : (
                <div className="space-y-3">
                  {needsAttention.map((listing) => (
                    <button
                      key={listing.listingId}
                      type="button"
                      onClick={() => navigate(`/seller/listings/${listing.listingId}`)}
                      className="w-full text-left rounded-lg border p-3 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground">{listing.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {listing.reason || (listing.status === "REJECTED" ? "Rejected - requires correction and resubmission" : "Draft - complete details and submit")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Listings Snapshot</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/seller/listings")}>Manage <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </div>
              <div className="space-y-3">
                {recentListings.map((listing) => (
                  <div key={listing.listingId} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(listing.updatedAt).toLocaleDateString()} · {listing.views ?? 0} views
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/seller/listings/${listing.listingId}`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-destructive">
              Failed to load dashboard data: {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SellerDashboardContent />
    </Suspense>
  );
}
