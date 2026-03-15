import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getReconciliationHistory } from "@/lib/reconciliation-api";
import { FINANCE_ROUTES } from "@/lib/finance-routes";

type HistoryItem = {
  id: number;
  month: number;
  year: number;
  status: string;
  netProfit: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function monthLabel(month: number, year: number) {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function ReportsIndexPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reconciledCount = items.filter((item) => item.status === "RECONCILED" || item.status === "RESOLVED").length;
  const positiveMonths = items.filter((item) => item.netProfit > 0).length;

  useEffect(() => {
    let mounted = true;

    getReconciliationHistory()
      .then((rows) => {
        if (!mounted) return;
        setItems(rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load report history.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      <section className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Reports</CardTitle>
            <CardDescription>Access generated reconciliation reports by month.</CardDescription>
          </CardHeader>
        </Card>

        {!loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-semibold">{items.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Reconciled or Resolved</p>
                <p className="text-2xl font-semibold">{reconciledCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Positive Net Months</p>
                <p className="text-2xl font-semibold">{positiveMonths}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <Card>
            <CardHeader>
              <CardTitle>Unable to load reports</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="gap-2">
                <Loader2 className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No reports yet</CardTitle>
              <CardDescription>Run a reconciliation first to generate the first monthly report.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!loading && !error && items.length > 0
          ? items.map((item) => (
              <Card key={item.id} className="border-border/70">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{monthLabel(item.month, item.year)}</CardTitle>
                    <CardDescription>Report #{item.id}</CardDescription>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Net profit: <span className="font-medium text-foreground">{formatCurrency(item.netProfit)}</span>
                  </div>
                  <Button asChild className="gap-2">
                    <Link to={FINANCE_ROUTES.reportById(item.id)}>
                      Open Report
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          : null}
      </section>
    </main>
  );
}
