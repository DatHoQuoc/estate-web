import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReportPanel } from "@/components/finances/ReportPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { MonthlyReport } from "@/lib/finance-type";
import { getMonthlyReport } from "@/lib/reconciliation-api";
import { FINANCE_ROUTES } from "@/lib/finance-routes";

export default function ReportPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const reportId = Number(id);

  const [report,  setReport]  = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(reportId)) {
      setError("Invalid report id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getMonthlyReport(reportId)
      .then(setReport)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load report"))
      .finally(() => setLoading(false));
  }, [id, reportId]);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{report ? `Report - ${report.monthLabel}` : "Monthly Report"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Detailed breakdown of revenue, refunds, and expenses for a reconciled period.
          </CardContent>
        </Card>

        <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate(FINANCE_ROUTES.reports)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {report ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-base font-semibold">{report.status}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-base font-semibold">{report.totalTransactions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Generated</p>
                <p className="text-base font-semibold">{new Date(report.generatedAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-lg" />
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {report && !loading && <ReportPanel report={report} />}
      </div>
    </main>
  );
}