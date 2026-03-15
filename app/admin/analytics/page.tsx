"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarRange, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminSectionScaffold } from "@/components/admin/AdminSectionScaffold";
import { StatsCard } from "@/components/common/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "../../../src/lib/auth-client";
import type { UserResponseDto } from "../../../src/lib/auth-types";

type EnrollmentRange = "30d" | "12m";

const qualityColors = ["#2563eb", "#f59e0b", "#10b981", "#a16207", "#dc2626"];

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function buildDailyEnrollmentSeries(users: UserResponseDto[]) {
  const today = startOfDay(new Date());
  const firstDay = addDays(today, -29);
  const buckets = new Map<string, number>();

  for (let index = 0; index < 30; index += 1) {
    const day = addDays(firstDay, index);
    const key = day.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  users.forEach((user) => {
    const createdAt = startOfDay(new Date(user.created_at));
    if (createdAt < firstDay || createdAt > today) return;

    const key = createdAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });

  return Array.from(buckets.entries()).map(([day, total]) => ({
    label: new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    total,
  }));
}

function buildMonthlyEnrollmentSeries(users: UserResponseDto[]) {
  const currentMonth = startOfMonth(new Date());
  const firstMonth = addMonths(currentMonth, -11);
  const buckets = new Map<string, number>();

  for (let index = 0; index < 12; index += 1) {
    const month = addMonths(firstMonth, index);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, 0);
  }

  users.forEach((user) => {
    const createdAt = new Date(user.created_at);
    const month = startOfMonth(createdAt);
    if (month < firstMonth || month > currentMonth) return;

    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });

  return Array.from(buckets.entries()).map(([month, total]) => ({
    label: new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
    total,
  }));
}

function filterUsersByRange(users: UserResponseDto[], range: EnrollmentRange) {
  const now = new Date();
  const cutoff = range === "30d" ? addDays(startOfDay(now), -29) : addMonths(startOfMonth(now), -11);
  return users.filter((user) => new Date(user.created_at) >= cutoff);
}

export default function AdminAnalyticsPage() {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<EnrollmentRange>("30d");

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await authClient.listAllUsers();
        if (!mounted) return;
        setUsers(data);
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load user analytics");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const orderedUsers = [...users].sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    );
    const current30dCutoff = addDays(startOfDay(new Date()), -29);
    const previous30dCutoff = addDays(current30dCutoff, -30);
    const currentMonth = startOfMonth(new Date());
    const previousMonth = addMonths(currentMonth, -1);

    const newLast30Days = users.filter((user) => new Date(user.created_at) >= current30dCutoff).length;
    const previous30Days = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt >= previous30dCutoff && createdAt < current30dCutoff;
    }).length;
    const currentMonthEnrollments = users.filter((user) => new Date(user.created_at) >= currentMonth).length;
    const previousMonthEnrollments = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt >= previousMonth && createdAt < currentMonth;
    }).length;
    const verifiedUsers = users.filter((user) => user.email_verified).length;
    const activeUsers = users.filter((user) => user.user_status === "active").length;
    const rangeUsers = filterUsersByRange(users, range);
    const series = range === "30d" ? buildDailyEnrollmentSeries(users) : buildMonthlyEnrollmentSeries(users);
    const qualityBreakdown = [
      {
        label: "Verified",
        value: rangeUsers.filter((user) => user.email_verified).length,
      },
      {
        label: "Unverified",
        value: rangeUsers.filter((user) => !user.email_verified).length,
      },
      {
        label: "Active",
        value: rangeUsers.filter((user) => user.user_status === "active").length,
      },
      {
        label: "Inactive",
        value: rangeUsers.filter((user) => user.user_status === "inactive").length,
      },
      {
        label: "Suspended",
        value: rangeUsers.filter((user) => user.user_status === "suspended").length,
      },
    ];

    return {
      currentMonthEnrollments,
      previousMonthEnrollments,
      newLast30Days,
      previous30Days,
      verifiedRate: users.length === 0 ? 0 : (verifiedUsers / users.length) * 100,
      activeRate: users.length === 0 ? 0 : (activeUsers / users.length) * 100,
      latestUsers: orderedUsers.slice(0, 8),
      qualityBreakdown,
      rangeUsersCount: rangeUsers.length,
      series,
      totalUsers: users.length,
    };
  }, [range, users]);

  const chartTitle = range === "30d" ? "Daily Enrollments" : "Monthly Enrollments";
  const chartDescription = range === "30d"
    ? "New user registrations over the last 30 days."
    : "New user registrations over the last 12 months.";

  return (
    <AdminSectionScaffold
      eyebrow="Administration"
      title="Analytics Dashboard"
      description="Starting with enrollment analytics: registration velocity, verification health, and the newest accounts entering the platform."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={loading ? "..." : analytics.totalUsers}
          icon={<BarChart3 className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          title="New in 30 Days"
          value={loading ? "..." : analytics.newLast30Days}
          icon={<UserPlus className="h-5 w-5" />}
          trend={
            loading
              ? undefined
              : {
                  value: analytics.previous30Days === 0
                    ? analytics.newLast30Days === 0
                      ? 0
                      : 100
                    : Math.round(((analytics.newLast30Days - analytics.previous30Days) / analytics.previous30Days) * 100),
                  direction: analytics.newLast30Days >= analytics.previous30Days ? "up" : "down",
                }
          }
          variant="info"
        />
        <StatsCard
          title="This Month"
          value={loading ? "..." : analytics.currentMonthEnrollments}
          trend={
            loading
              ? undefined
              : {
                  value: analytics.previousMonthEnrollments === 0
                    ? analytics.currentMonthEnrollments === 0
                      ? 0
                      : 100
                    : Math.round(((analytics.currentMonthEnrollments - analytics.previousMonthEnrollments) / analytics.previousMonthEnrollments) * 100),
                  direction: analytics.currentMonthEnrollments >= analytics.previousMonthEnrollments ? "up" : "down",
                }
          }
          icon={<CalendarRange className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          title="Verified Rate"
          value={loading ? "..." : formatPercent(analytics.verifiedRate)}
          icon={<ShieldCheck className="h-5 w-5" />}
          variant="warning"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Enrollment window</p>
          <p className="text-xs text-muted-foreground">
            Switch between short-term and yearly signup trends without leaving the dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={range === "30d" ? "default" : "outline"} size="sm" onClick={() => setRange("30d")}>
            Last 30 Days
          </Button>
          <Button variant={range === "12m" ? "default" : "outline"} size="sm" onClick={() => setRange("12m")}>
            Last 12 Months
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="mt-6 border-destructive/40">
          <CardHeader>
            <CardTitle>Analytics unavailable</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{chartTitle}</CardTitle>
            <CardDescription>{chartDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading enrollment trend...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.series}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                    <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Quality</CardTitle>
            <CardDescription>
              Current account outcomes among the {analytics.rangeUsersCount} users enrolled in the selected window.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading quality mix...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.qualityBreakdown} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {analytics.qualityBreakdown.map((entry, index) => (
                        <Cell key={entry.label} fill={qualityColors[index % qualityColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Latest Enrollments</CardTitle>
            <CardDescription>The newest accounts created on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading recent users...
              </div>
            ) : analytics.latestUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users available.</p>
            ) : (
              analytics.latestUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{user.display_name || user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize text-foreground">{user.user_status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Signals</CardTitle>
            <CardDescription>Quick read on registration quality and account readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Active Rate</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{loading ? "..." : formatPercent(analytics.activeRate)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Users in Selected Window</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{loading ? "..." : analytics.rangeUsersCount}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Interpretation</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use the 30-day view to monitor recent acquisition changes and the 12-month view to spot seasonality before adding backend cohort or source analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSectionScaffold>
  );
}