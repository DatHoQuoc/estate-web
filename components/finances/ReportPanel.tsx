import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/hooks/use-toast";
import { Download, FileText, Mail, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonthlyReport, ReconciliationStatus } from "@/lib/finance-type";
import { exportReport, emailReport } from "@/lib/reconciliation-api";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const statusBadge: Record<ReconciliationStatus, { label: string; className: string }> = {
  PENDING:     { label: "Pending",     className: "bg-muted text-muted-foreground"                           },
  RECONCILED:  { label: "Reconciled",  className: "bg-success/10 text-success border-success/20"             },
  DISCREPANCY: { label: "Discrepancy", className: "bg-destructive/10 text-destructive border-destructive/20" },
  RESOLVED:    { label: "Resolved",    className: "bg-primary/10 text-primary border-primary/20"             },
};

interface ReportPanelProps {
  report: MonthlyReport;
  adminId?: string;
}

export function ReportPanel({ report, adminId = "00000000-0000-0000-0000-000000000000" }: ReportPanelProps) {
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [emailing,  setEmailing]  = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const rows = contentRef.current.querySelectorAll("[data-row]");
    gsap.fromTo(rows, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" });
  }, [report.id]);

  const handleExport = async (format: "excel" | "pdf") => {
    setExporting(format);
    try {
      const url = await exportReport(report.id);
      toast({ title: "Export Ready", description: `${format === "excel" ? "Excel" : "PDF"} file generated.` });
      window.open(url, "_blank");
    } catch (err: unknown) {
      toast({ title: "Export Failed", description: err instanceof Error ? err.message : "Unexpected error", variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const handleEmail = async () => {
    setEmailing(true);
    try {
      await emailReport(report.id, adminId);
      toast({ title: "Email Sent", description: `${report.monthLabel} report emailed to leadership team.` });
    } catch (err: unknown) {
      toast({ title: "Email Failed", description: err instanceof Error ? err.message : "Unexpected error", variant: "destructive" });
    } finally {
      setEmailing(false);
    }
  };

  const metrics = [
    { label: "Total Revenue",    value: report.totalRevenue,  deducted: false              },
    { label: "Total Refunds",    value: report.totalRefunds,  deducted: true               },
    { label: "Net Revenue",      value: report.netRevenue,    deducted: false              },
    { label: "Total Expenses",   value: report.totalExpenses, deducted: true               },
    { label: "Net Profit / Loss",value: report.netProfitLoss, deducted: false, bold: true  },
  ];

  const badge = statusBadge[report.status];

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-card-foreground">{report.monthLabel} Financial Summary</h2>
            <Badge variant="outline" className={cn("text-xs", badge.className)}>{badge.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(report.generatedAt).toLocaleDateString("vi-VN")} ·{" "}
            {report.totalTransactions.toLocaleString()} transactions · {report.resolvedDiscrepancies} discrepancies resolved
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" disabled={exporting !== null} onClick={() => handleExport("excel")}>
            {exporting === "excel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Excel
          </Button>
          <Button variant="outline" size="sm" disabled={exporting !== null} onClick={() => handleExport("pdf")}>
            {exporting === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Export PDF
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={emailing}>
                {emailing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Email to Leadership
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Email Report to Leadership?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will send the {report.monthLabel} financial report to the CEO and Founder email addresses on file.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEmail}>Send Email</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Metric rows */}
      <div ref={contentRef} className="divide-y divide-border">
        {metrics.map((m) => (
          <div key={m.label} data-row className={cn("flex items-center justify-between px-6 py-4", m.bold && "bg-muted/30")}>
            <span className={cn("text-sm", m.bold ? "font-bold text-card-foreground" : "text-muted-foreground")}>{m.label}</span>
            <div className="flex items-center gap-2">
              {m.bold && (m.value >= 0
                ? <TrendingUp className="h-4 w-4 text-success" />
                : <TrendingDown className="h-4 w-4 text-destructive" />)}
              <span className={cn(
                "font-mono font-bold",
                m.bold ? "text-lg" : "text-base",
                m.bold
                  ? m.value >= 0 ? "text-success" : "text-destructive"
                  : m.deducted   ? "text-destructive" : "text-card-foreground",
              )}>
                {formatCurrency(Math.abs(m.value))}
                {m.deducted && <span className="text-xs font-normal ml-1">(deducted)</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Expense breakdown */}
      {report.expenseLines.length > 0 && (
        <div className="border-t border-border px-6 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Expense Breakdown</p>
          <div className="space-y-2">
            {report.expenseLines.map((e) => (
              <div key={e.category} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{e.category.replace(/_/g, " ").toLowerCase()}</span>
                <span className="font-mono text-sm text-card-foreground">{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border px-6 py-3 bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          This report is read-only. To make adjustments, resolve discrepancies in the Transaction Audit page before reconciliation.
        </p>
      </div>
    </div>
  );
}