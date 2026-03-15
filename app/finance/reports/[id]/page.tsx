import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";   // ← react-router, not next/navigation
import { TopBar } from "@/components/shared/TopBar";
import { ReportPanel } from "@/components/finances/ReportPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { MonthlyReport } from "@/lib/finance-type";
import { getMonthlyReport } from "@/lib/reconciliation-api";

export default function ReportPage() {
  // Route registered as /finance/reports/:id in App.tsx
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();

  const [report,  setReport]  = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getMonthlyReport(Number(id))
      .then(setReport)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load report"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <TopBar title={report ? `Report — ${report.monthLabel}` : "Monthly Report"} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate("/finance/reconciliation")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

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