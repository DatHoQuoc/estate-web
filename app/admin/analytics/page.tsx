"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, CalendarRange, CreditCard, Filter, Loader2, ShieldCheck, UserPlus, Wallet, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient } from "../../../src/lib/auth-client";
import type { UserResponseDto } from "../../../src/lib/auth-types";
import {
  getAdminTransactions,
  getAdminAnalyticsOverview,
  getAdminCreditUsage,
  getAdminRevenueStats,
  getAdminTopSpenders,
  getAdminWalletStats,
  type AdminCreditUsageDTO,
  type AdminOverviewDTO,
  type AdminRevenueDTO,
  type AdminTransactionSortBy,
  type AdminTransactionsQuery,
  type AdminUserDTO,
  type AdminWalletStatsDTO,
  type CreditTransaction,
} from "@/lib/creditApi";

type EnrollmentRange = "30d" | "12m";
type TransactionFilterKey =
  | "userId"
  | "type"
  | "status"
  | "referenceType"
  | "referenceId"
  | "minAmount"
  | "maxAmount"
  | "fromDate"
  | "toDate";

interface TransactionFilterRule {
  id: string;
  key: TransactionFilterKey;
  value: string;
  displayValue: string;
}

function SuspenseOnRefresh(props: { promise: Promise<void> | null; children: React.ReactNode }) {
  if (props.promise) {
    throw props.promise;
  }
  return <>{props.children}</>;
}

const qualityColors = ["#2563eb", "#f59e0b", "#10b981", "#a16207", "#dc2626"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeClass(status: string) {
  if (status === "SUCCESS") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "PENDING") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

function getTypeBadgeClass(type: string) {
  if (type === "PURCHASE") return "bg-blue-100 text-blue-700 border-blue-200";
  if (type === "REFUND") return "bg-zinc-100 text-zinc-700 border-zinc-200";
  if (type === "AI_CHAT") return "bg-violet-100 text-violet-700 border-violet-200";
  if (type === "POST_CHARGE") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-cyan-100 text-cyan-700 border-cyan-200";
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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCredit, setLoadingCredit] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorCredit, setErrorCredit] = useState<string | null>(null);
  const [range, setRange] = useState<EnrollmentRange>("30d");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [overview, setOverview] = useState<AdminOverviewDTO | null>(null);
  const [revenue, setRevenue] = useState<AdminRevenueDTO | null>(null);
  const [creditUsage, setCreditUsage] = useState<AdminCreditUsageDTO | null>(null);
  const [walletStats, setWalletStats] = useState<AdminWalletStatsDTO | null>(null);
  const [topSpenders, setTopSpenders] = useState<AdminUserDTO[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [queryBuilderKey, setQueryBuilderKey] = useState<TransactionFilterKey>("userId");
  const [queryBuilderValue, setQueryBuilderValue] = useState("");
  const [appliedTransactionFilters, setAppliedTransactionFilters] = useState<TransactionFilterRule[]>([]);
  const [sortState, setSortState] = useState<{
    sortBy: AdminTransactionSortBy;
    sortDir: "asc" | "desc";
  }>({
    sortBy: "date",
    sortDir: "desc",
  });
  const [lastFilterAppliedAt, setLastFilterAppliedAt] = useState<Date | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [refreshPromise, setRefreshPromise] = useState<Promise<void> | null>(null);
  const refreshResolverRef = useRef<null | (() => void)>(null);

  const transactionQuery = useMemo<AdminTransactionsQuery>(() => {
    const query: AdminTransactionsQuery = {
      sortBy: sortState.sortBy,
      sortDir: sortState.sortDir,
    };

    const userIds = appliedTransactionFilters
      .filter((filter) => filter.key === "userId")
      .map((filter) => filter.value);

    if (userIds.length) {
      query.userIds = userIds;
    }

    appliedTransactionFilters.forEach((filter) => {
      switch (filter.key) {
        case "type":
          query.type = filter.value as any;
          break;
        case "status":
          query.status = filter.value as any;
          break;
        case "referenceType":
          query.referenceType = filter.value;
          break;
        case "referenceId":
          query.referenceId = filter.value;
          break;
        case "minAmount":
          query.minAmount = Number(filter.value);
          break;
        case "maxAmount":
          query.maxAmount = Number(filter.value);
          break;
        case "fromDate":
          query.fromDate = filter.value;
          break;
        case "toDate":
          query.toDate = filter.value;
          break;
        default:
          break;
      }
    });

    return query;
  }, [appliedTransactionFilters, sortState]);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await authClient.listAllUsers();
        if (!mounted) return;
        setUsers(data);
        setErrorUsers(null);
      } catch (loadError) {
        if (!mounted) return;
        setErrorUsers(loadError instanceof Error ? loadError.message : "Failed to load user analytics");
      } finally {
        if (mounted) {
          setLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [refreshNonce]);

  useEffect(() => {
    let mounted = true;

    const loadCreditAnalytics = async () => {
      setLoadingCredit(true);
      try {
        const [overviewData, revenueData, creditUsageData, walletStatsData, topSpendersData, transactionData] = await Promise.all([
          getAdminAnalyticsOverview(),
          getAdminRevenueStats(selectedMonth, selectedYear),
          getAdminCreditUsage(selectedMonth, selectedYear),
          getAdminWalletStats(),
          getAdminTopSpenders(10),
          getAdminTransactions({
            month: selectedMonth,
            year: selectedYear,
            ...transactionQuery,
          }),
        ]);

        if (!mounted) return;
        setOverview(overviewData);
        setRevenue(revenueData);
        setCreditUsage(creditUsageData);
        setWalletStats(walletStatsData);
        setTopSpenders(topSpendersData);
        setTransactions(transactionData);
        setErrorCredit(null);
      } catch (loadError) {
        if (!mounted) return;
        setErrorCredit(loadError instanceof Error ? loadError.message : "Failed to load credit admin analytics");
      } finally {
        if (mounted) {
          setLoadingCredit(false);
        }
      }
    };

    loadCreditAnalytics();

    return () => {
      mounted = false;
    };
  }, [selectedMonth, selectedYear, transactionQuery, refreshNonce]);

  useEffect(() => {
    if (!refreshPromise) return;
    if (loadingUsers || loadingCredit) return;

    refreshResolverRef.current?.();
    refreshResolverRef.current = null;
    setRefreshPromise(null);
  }, [refreshPromise, loadingUsers, loadingCredit]);

  const refreshAllDataWithSuspense = () => {
    if (refreshPromise) return;

    let resolver: () => void = () => undefined;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    refreshResolverRef.current = resolver;
    setRefreshPromise(promise);
    setRefreshNonce((previous) => previous + 1);
  };

  const normalizeDateFilter = (value: string) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  };

  const addTransactionFilter = () => {
    const rawValue = queryBuilderValue.trim();
    if (!rawValue) return;

    let normalizedValue = rawValue;
    if (queryBuilderKey === "fromDate" || queryBuilderKey === "toDate") {
      normalizedValue = normalizeDateFilter(rawValue);
      if (!normalizedValue) return;
    }

    const getDisplayValue = () => {
      if (queryBuilderKey === "userId") {
        return getUsernameByUserId(normalizedValue);
      }
      if (queryBuilderKey === "minAmount" || queryBuilderKey === "maxAmount") {
        return formatCurrency(Number(normalizedValue));
      }
      if (queryBuilderKey === "fromDate" || queryBuilderKey === "toDate") {
        return formatDateTime(normalizedValue);
      }
      return normalizedValue;
    };

    setAppliedTransactionFilters((previous) => {
      const singleValueKeys: TransactionFilterKey[] = [
        "type",
        "status",
        "referenceType",
        "referenceId",
        "minAmount",
        "maxAmount",
        "fromDate",
        "toDate",
      ];

      const deduped = singleValueKeys.includes(queryBuilderKey)
        ? previous.filter((item) => item.key !== queryBuilderKey)
        : previous;

      const duplicate = deduped.find((item) => item.key === queryBuilderKey && item.value === normalizedValue);
      if (duplicate) return deduped;

      return [
        ...deduped,
        {
          id: `${queryBuilderKey}-${normalizedValue}-${Date.now()}`,
          key: queryBuilderKey,
          value: normalizedValue,
          displayValue: getDisplayValue(),
        },
      ];
    });

    setLastFilterAppliedAt(new Date());
  };

  const removeTransactionFilter = (id: string) => {
    setAppliedTransactionFilters((previous) => previous.filter((filter) => filter.id !== id));
    setLastFilterAppliedAt(new Date());
  };

  const resetTransactionFilters = () => {
    setAppliedTransactionFilters([]);
    setSortState({ sortBy: "date", sortDir: "desc" });
    setQueryBuilderKey("userId");
    setQueryBuilderValue("");
    setLastFilterAppliedAt(new Date());
  };

  const handleLedgerSort = (sortBy: AdminTransactionSortBy) => {
    setSortState((previous) => {
      if (previous.sortBy !== sortBy) {
        return { sortBy, sortDir: "desc" };
      }
      return {
        sortBy,
        sortDir: previous.sortDir === "desc" ? "asc" : "desc",
      };
    });
    setLastFilterAppliedAt(new Date());
  };

  const sortIndicator = (sortBy: AdminTransactionSortBy) => {
    if (sortState.sortBy !== sortBy) return "";
    return sortState.sortDir === "desc" ? " ↓" : " ↑";
  };

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

  const usageDistribution = useMemo(() => {
    if (!creditUsage) return [];
    return [
      { name: "Purchases", value: creditUsage.totalPurchases },
      { name: "AI Chat", value: creditUsage.totalAiChatDeductions },
      { name: "Post Charges", value: creditUsage.totalPostCharges },
      { name: "Listing Fees", value: creditUsage.totalListingFees },
      { name: "Refunds", value: creditUsage.totalRefunds },
    ];
  }, [creditUsage]);

  const usersById = useMemo(() => {
    const map = new Map<string, UserResponseDto>();
    users.forEach((user) => {
      map.set(user.user_id, user);
    });
    return map;
  }, [users]);

  const getUsernameByUserId = (userId: string) => {
    const user = usersById.get(userId);
    if (!user) return `${userId.slice(0, 8)}...`;

    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return user.display_name || fullName || user.email;
  };

  const hasAnyError = Boolean(errorUsers || errorCredit);

  const activeTransactionFilters = useMemo(() => {
    return appliedTransactionFilters.map((filter) => ({
      id: filter.id,
      key: filter.key,
      label: `${filter.key}: ${filter.displayValue}`,
    }));
  }, [appliedTransactionFilters]);

  const userFilterOptions = useMemo(() => {
    return users
      .map((user) => ({
        id: user.user_id,
        label: user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [users]);

  const getFilterDisplayName = (key: TransactionFilterKey) => {
    if (key === "userId") return "User";
    if (key === "type") return "Type";
    if (key === "status") return "Status";
    if (key === "referenceType") return "Reference Type";
    if (key === "referenceId") return "Reference ID";
    if (key === "minAmount") return "Min Amount";
    if (key === "maxAmount") return "Max Amount";
    if (key === "fromDate") return "From Date";
    return "To Date";
  };

  return (
    <AdminSectionScaffold
      eyebrow="Administration"
      title="Analytics Dashboard"
      description="Unified analytics powered by user-service and credit-service admin endpoints, split into overview, users, and transactions-focused workspaces."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="All-Time Net Revenue"
          value={loadingCredit || !overview ? "..." : formatCurrency(overview.netRevenueAllTime)}
          icon={<CreditCard className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          title="Total Wallets"
          value={loadingCredit || !overview ? "..." : overview.totalWallets}
          icon={<Wallet className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          title="Transactions (Month)"
          value={loadingCredit || !revenue ? "..." : revenue.transactionCount}
          icon={<BarChart3 className="h-5 w-5" />}
          variant="info"
        />
        <StatsCard
          title="Total Users"
          value={loadingUsers ? "..." : analytics.totalUsers}
          icon={<UserPlus className="h-5 w-5" />}
          variant="default"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Analytics Period</p>
          <p className="text-xs text-muted-foreground">Revenue, credit usage, and ledger data use the selected month and year.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAllDataWithSuspense} disabled={Boolean(refreshPromise)}>
            {refreshPromise ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const monthIndex = selectedMonth - 2;
              const prevDate = new Date(selectedYear, monthIndex, 1);
              setSelectedMonth(prevDate.getMonth() + 1);
              setSelectedYear(prevDate.getFullYear());
            }}
          >
            Prev Month
          </Button>
          <Button variant="default" size="sm" className="min-w-36">
            <CalendarRange className="mr-2 h-4 w-4" />
            {new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextDate = new Date(selectedYear, selectedMonth, 1);
              const current = new Date();
              if (nextDate > new Date(current.getFullYear(), current.getMonth(), 1)) return;
              setSelectedMonth(nextDate.getMonth() + 1);
              setSelectedYear(nextDate.getFullYear());
            }}
          >
            Next Month
          </Button>
        </div>
      </div>

      {hasAnyError ? (
        <Card className="mt-6 border-destructive/40">
          <CardHeader>
            <CardTitle>Analytics unavailable</CardTitle>
            <CardDescription>{errorCredit || errorUsers}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Suspense
        fallback={
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Refreshing analytics</CardTitle>
              <CardDescription>Fetching the latest user and transaction data...</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait while the dashboard refreshes.
            </CardContent>
          </Card>
        }
      >
        <SuspenseOnRefresh promise={refreshPromise}>
      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="all">All Information</TabsTrigger>
          <TabsTrigger value="users">Users Focused</TabsTrigger>
          <TabsTrigger value="money">Money & Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Overview Snapshot</CardTitle>
                <CardDescription>Platform-level wallet and admin queue health.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {loadingCredit || !overview ? (
                  <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading overview...</div>
                ) : (
                  <>
                    <p>Total transactions: <span className="font-semibold text-foreground">{overview.totalTransactions.toLocaleString()}</span></p>
                    <p>Pending refunds: <span className="font-semibold text-foreground">{overview.pendingRefundRequests}</span></p>
                    <p>Pending reconciliations: <span className="font-semibold text-foreground">{overview.pendingReconciliations}</span></p>
                    <p>All-time refunds: <span className="font-semibold text-foreground">{formatCurrency(overview.totalRefundsAllTime)}</span></p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Snapshot</CardTitle>
                <CardDescription>Selected month financial performance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {loadingCredit || !revenue ? (
                  <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading revenue...</div>
                ) : (
                  <>
                    <p>Gross revenue: <span className="font-semibold text-foreground">{formatCurrency(revenue.totalRevenue)}</span></p>
                    <p>Net revenue: <span className="font-semibold text-foreground">{formatCurrency(revenue.netRevenue)}</span></p>
                    <p>Growth MoM: <span className="font-semibold text-foreground">{revenue.revenueGrowthPercent.toFixed(2)}%</span></p>
                    <p>Transactions: <span className="font-semibold text-foreground">{revenue.transactionCount.toLocaleString()}</span></p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Snapshot</CardTitle>
                <CardDescription>Enrollment and account quality at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {loadingUsers ? (
                  <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading users...</div>
                ) : (
                  <>
                    <p>New users (30d): <span className="font-semibold text-foreground">{analytics.newLast30Days}</span></p>
                    <p>Current month signups: <span className="font-semibold text-foreground">{analytics.currentMonthEnrollments}</span></p>
                    <p>Verified rate: <span className="font-semibold text-foreground">{formatPercent(analytics.verifiedRate)}</span></p>
                    <p>Active rate: <span className="font-semibold text-foreground">{formatPercent(analytics.activeRate)}</span></p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Usage Distribution (Selected Month)</CardTitle>
                <CardDescription>Amount totals by transaction category.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {loadingCredit ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading distribution...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {usageDistribution.map((entry, index) => (
                            <Cell key={entry.name} fill={qualityColors[index % qualityColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Spenders</CardTitle>
                <CardDescription>Highest total spend from wallet activity.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCredit ? (
                      <TableRow><TableCell colSpan={2}>Loading spenders...</TableCell></TableRow>
                    ) : topSpenders.length === 0 ? (
                      <TableRow><TableCell colSpan={2}>No spender data.</TableCell></TableRow>
                    ) : (
                      topSpenders.slice(0, 6).map((spender) => (
                        <TableRow key={spender.userId}>
                          <TableCell>
                            <p className="font-medium text-foreground">{getUsernameByUserId(spender.userId)}</p>
                            <p className="font-mono text-xs text-muted-foreground">{spender.userId.slice(0, 8)}...</p>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(spender.totalSpent)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Enrollment window controls</p>
            <div className="flex items-center gap-2">
              <Button variant={range === "30d" ? "default" : "outline"} size="sm" onClick={() => setRange("30d")}>Last 30 Days</Button>
              <Button variant={range === "12m" ? "default" : "outline"} size="sm" onClick={() => setRange("12m")}>Last 12 Months</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard title="New in 30 Days" value={loadingUsers ? "..." : analytics.newLast30Days} icon={<UserPlus className="h-5 w-5" />} variant="info" />
            <StatsCard title="This Month" value={loadingUsers ? "..." : analytics.currentMonthEnrollments} icon={<CalendarRange className="h-5 w-5" />} variant="success" />
            <StatsCard title="Verified Rate" value={loadingUsers ? "..." : formatPercent(analytics.verifiedRate)} icon={<ShieldCheck className="h-5 w-5" />} variant="warning" />
            <StatsCard title="Users in Window" value={loadingUsers ? "..." : analytics.rangeUsersCount} icon={<BarChart3 className="h-5 w-5" />} variant="default" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>{chartTitle}</CardTitle>
                <CardDescription>{chartDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {loadingUsers ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading enrollment trend...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.series}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} itemStyle={{ color: "var(--foreground)" }} />
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
                <CardDescription>Account outcomes in selected enrollment window.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {loadingUsers ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading quality mix...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.qualityBreakdown} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} itemStyle={{ color: "var(--foreground)" }} />
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

          <Card>
            <CardHeader>
              <CardTitle>Latest Enrollments</CardTitle>
              <CardDescription>Newest accounts from user-service.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow><TableCell colSpan={4}>Loading latest users...</TableCell></TableRow>
                  ) : analytics.latestUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No users available.</TableCell></TableRow>
                  ) : (
                    analytics.latestUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>{user.display_name || user.first_name || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.user_status}</TableCell>
                        <TableCell className="text-right">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="money" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard title="Revenue" value={loadingCredit || !revenue ? "..." : formatCurrency(revenue.totalRevenue)} icon={<CreditCard className="h-5 w-5" />} variant="success" />
            <StatsCard title="Refunds" value={loadingCredit || !revenue ? "..." : formatCurrency(revenue.totalRefunds)} icon={<CreditCard className="h-5 w-5" />} variant="warning" />
            <StatsCard title="Net Revenue" value={loadingCredit || !revenue ? "..." : formatCurrency(revenue.netRevenue)} icon={<CreditCard className="h-5 w-5" />} variant="default" />
            <StatsCard title="Avg Wallet Balance" value={loadingCredit || !walletStats ? "..." : formatCompactNumber(walletStats.averageBalance)} icon={<Wallet className="h-5 w-5" />} variant="info" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4" />Transaction Filters & Sorting</CardTitle>
              <CardDescription>
                Build filters one by one. Each added condition appears as a removable chip and is sent to the API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Filter Field</p>
                  <Select value={queryBuilderKey} onValueChange={(value) => {
                    setQueryBuilderKey(value as TransactionFilterKey);
                    setQueryBuilderValue("");
                  }}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="userId">User</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="referenceType">Reference Type</SelectItem>
                      <SelectItem value="referenceId">Reference ID</SelectItem>
                      <SelectItem value="minAmount">Min Amount</SelectItem>
                      <SelectItem value="maxAmount">Max Amount</SelectItem>
                      <SelectItem value="fromDate">From Date</SelectItem>
                      <SelectItem value="toDate">To Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Value</p>
                  {queryBuilderKey === "userId" ? (
                    <Select value={queryBuilderValue} onValueChange={setQueryBuilderValue}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select a user" /></SelectTrigger>
                      <SelectContent>
                        {userFilterOptions.map((user) => (
                          <SelectItem key={user.id} value={user.id}>{user.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : queryBuilderKey === "type" ? (
                    <Select value={queryBuilderValue} onValueChange={setQueryBuilderValue}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PURCHASE">PURCHASE</SelectItem>
                        <SelectItem value="AI_CHAT">AI_CHAT</SelectItem>
                        <SelectItem value="LISTING_FEE">LISTING_FEE</SelectItem>
                        <SelectItem value="REFUND">REFUND</SelectItem>
                        <SelectItem value="POST_CHARGE">POST_CHARGE</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : queryBuilderKey === "status" ? (
                    <Select value={queryBuilderValue} onValueChange={setQueryBuilderValue}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                        <SelectItem value="FAILED">FAILED</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : queryBuilderKey === "fromDate" || queryBuilderKey === "toDate" ? (
                    <Input type="datetime-local" value={queryBuilderValue} onChange={(event) => setQueryBuilderValue(event.target.value)} />
                  ) : queryBuilderKey === "minAmount" || queryBuilderKey === "maxAmount" ? (
                    <Input type="number" placeholder="0" value={queryBuilderValue} onChange={(event) => setQueryBuilderValue(event.target.value)} />
                  ) : (
                    <Input
                      placeholder={queryBuilderKey === "referenceType" ? "PAYOS" : "order-1700000001"}
                      value={queryBuilderValue}
                      onChange={(event) => setQueryBuilderValue(event.target.value)}
                    />
                  )}
                </div>

                <div className="flex items-end">
                  <Button className="w-full md:w-auto" onClick={addTransactionFilter} disabled={!queryBuilderValue || loadingCredit}>
                    Add Filter
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={resetTransactionFilters} disabled={loadingCredit}>Reset</Button>
                <p className="text-xs text-muted-foreground">
                  Sort using ledger column headers. Month and year are controlled by the period selector above.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeTransactionFilters.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No active filters. Showing all records for selected month/year.</p>
                ) : (
                  activeTransactionFilters.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => removeTransactionFilter(chip.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      {chip.label}
                      <X className="h-3 w-3" />
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Credit Usage Breakdown</CardTitle>
                <CardDescription>Amount totals and operation counts for selected month.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {loadingCredit || !creditUsage ? (
                  <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading usage...</div>
                ) : (
                  <>
                    <p>Purchases: <span className="font-semibold text-foreground">{formatCurrency(creditUsage.totalPurchases)} ({creditUsage.purchaseCount})</span></p>
                    <p>AI chat deductions: <span className="font-semibold text-foreground">{formatCurrency(creditUsage.totalAiChatDeductions)} ({creditUsage.aiChatCount})</span></p>
                    <p>Post charges: <span className="font-semibold text-foreground">{formatCurrency(creditUsage.totalPostCharges)} ({creditUsage.postChargeCount})</span></p>
                    <p>Listing fees: <span className="font-semibold text-foreground">{formatCurrency(creditUsage.totalListingFees)} ({creditUsage.listingFeeCount})</span></p>
                    <p>Refunds: <span className="font-semibold text-foreground">{formatCurrency(creditUsage.totalRefunds)} ({creditUsage.refundCount})</span></p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wallet System Stats</CardTitle>
                <CardDescription>Aggregate wallet balances across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {loadingCredit || !walletStats ? (
                  <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading wallets...</div>
                ) : (
                  <>
                    <p>Total wallets: <span className="font-semibold text-foreground">{walletStats.totalWallets.toLocaleString()}</span></p>
                    <p>Total balance: <span className="font-semibold text-foreground">{formatCurrency(walletStats.totalBalanceInSystem)}</span></p>
                    <p>Reserved balance: <span className="font-semibold text-foreground">{formatCurrency(walletStats.totalReservedBalance)}</span></p>
                    <p>Average balance: <span className="font-semibold text-foreground">{formatCurrency(walletStats.averageBalance)}</span></p>
                    <p>Zero-balance wallets: <span className="font-semibold text-foreground">{walletStats.zeroBalanceWallets.toLocaleString()}</span></p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Transaction Ledger</CardTitle>
              <CardDescription>
                Filtered and sorted transaction list for the selected month/year. Showing {transactions.length.toLocaleString()} result(s)
                {lastFilterAppliedAt ? ` · Last updated ${formatDateTime(lastFilterAppliedAt.toISOString())}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:text-foreground" onClick={() => handleLedgerSort("userId")}>
                        User{sortIndicator("userId")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:text-foreground" onClick={() => handleLedgerSort("type")}>
                        Type{sortIndicator("type")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:text-foreground" onClick={() => handleLedgerSort("status")}>
                        Status{sortIndicator("status")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:text-foreground" onClick={() => handleLedgerSort("referenceId")}>
                        Reference{sortIndicator("referenceId")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button type="button" className="font-medium hover:text-foreground" onClick={() => handleLedgerSort("amount")}>
                        Amount{sortIndicator("amount")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button type="button" className="font-medium hover:text-foreground" onClick={() => handleLedgerSort("date")}>
                        Created{sortIndicator("date")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCredit ? (
                    <TableRow><TableCell colSpan={7}>Loading transactions...</TableCell></TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow><TableCell colSpan={7}>No transactions found for this month.</TableCell></TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.transactionId}>
                        <TableCell>#{transaction.transactionId}</TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">{getUsernameByUserId(transaction.wallet.userId)}</p>
                          <p className="font-mono text-xs text-muted-foreground">{transaction.wallet.userId.slice(0, 8)}...</p>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTypeBadgeClass(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.referenceId || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="text-right">{formatDateTime(transaction.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </SuspenseOnRefresh>
      </Suspense>
    </AdminSectionScaffold>
  );
}