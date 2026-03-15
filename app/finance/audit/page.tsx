import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/shared/TopBar";
import { AuditTable } from "@/components/finances/AuditTable";
import { ManualAdjustmentModal } from "@/components/finances/ManualAdjustmentModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { TransactionRecord } from "@/lib/finance-type";
import { getAudit } from "@/lib/reconciliation-api";

const MONTHS = [
  { value: "1",  label: "January"   }, { value: "2",  label: "February"  },
  { value: "3",  label: "March"     }, { value: "4",  label: "April"     },
  { value: "5",  label: "May"       }, { value: "6",  label: "June"      },
  { value: "7",  label: "July"      }, { value: "8",  label: "August"    },
  { value: "9",  label: "September" }, { value: "10", label: "October"   },
  { value: "11", label: "November"  }, { value: "12", label: "December"  },
];
const now   = new Date();
const YEARS = [now.getFullYear() - 1, now.getFullYear()].map(String);

export default function AuditPage() {
  const [month,    setMonth]    = useState(String(now.getMonth() + 1));
  const [year,     setYear]     = useState(String(now.getFullYear()));
  const [records,  setRecords]  = useState<TransactionRecord[]>([]);
  const [counts,   setCounts]   = useState({ total: 0, unmatched: 0, partial: 0 });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState<TransactionRecord | null>(null);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAudit(Number(month), Number(year));
      setRecords(res.entries);
      setCounts({ total: res.totalCount, unmatched: res.unmatchedCount, partial: res.partialCount });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load audit data";
      setError(msg);
      toast({ title: "Load Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const filtered = filter === "all" ? records : records.filter((r) => r.matchStatus === filter);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Transaction Audit" />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Period selector */}
        <div className="flex items-center gap-3 flex-wrap border-b border-border pb-4">
          <span className="text-sm font-medium text-muted-foreground">Period:</span>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAudit} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">System vs Gateway Records</h2>
            {counts.unmatched > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                {counts.unmatched} unmatched
              </Badge>
            )}
            {counts.partial > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                {counts.partial} partial
              </Badge>
            )}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({counts.total})</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="adjusted">Adjusted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table / states */}
        {loading && records.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : error && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={fetchAudit}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground text-sm">No transactions found for this period / filter.</p>
          </div>
        ) : (
          <AuditTable records={filtered} onRowClick={setSelected} />
        )}

        <ManualAdjustmentModal
          record={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onActionSuccess={fetchAudit}
        />
      </div>
    </main>
  );
}