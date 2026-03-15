import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReconciliationSummary } from "@/lib/finance-type";
import { useNavigate } from "react-router-dom";
import { FINANCE_ROUTES } from "@/lib/finance-routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/hooks/use-toast";

interface CrossCheckPanelProps {
  data: ReconciliationSummary;
}

export function CrossCheckPanel({ data }: CrossCheckPanelProps) {
  const navigate = useNavigate();
  const isHealthy = data.discrepancyPercent < 1;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Cross-Check Summary</h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total System Value</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-card-foreground">
            {formatCurrency(data.systemTotal)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Gateway Receipts</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-card-foreground">
            {formatCurrency(data.gatewayTotal)}
          </p>
        </div>
      </div>

      <div className={`rounded-lg p-4 flex items-center justify-between ${
        isHealthy ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"
      }`}>
        <div className="flex items-center gap-3">
          {isHealthy ? (
            <CheckCircle2 className="h-6 w-6 text-success" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-destructive" />
          )}
          <div>
            <p className={`font-semibold ${isHealthy ? "text-success" : "text-destructive"}`}>
              {isHealthy ? "Within Tolerance" : "Discrepancy Detected"}
            </p>
            <p className="text-sm text-muted-foreground">
              Variance: <span className="font-mono">{formatCurrency(data.discrepancyAmount)}</span>{" "}
              (<span className="font-mono">{data.discrepancyPercent.toFixed(2)}%</span>)
            </p>
          </div>
        </div>

        {isHealthy ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-success text-success-foreground hover:bg-success/90">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Reconcile Month
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reconcile {data.monthLabel}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark {data.monthLabel} as reconciled and generate the monthly report. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => {
                    toast({ title: "Month Reconciled", description: `${data.monthLabel} has been marked as reconciled.` });
                  }}
                >
                  Confirm Reconciliation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="destructive" onClick={() => navigate(FINANCE_ROUTES.audit)}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Review Transactions
          </Button>
        )}
      </div>
    </div>
  );
}
