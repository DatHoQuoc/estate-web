import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionRecord } from "@/lib/finance-type";
import { cn } from "@/lib/utils";

interface AuditTableProps {
  records: TransactionRecord[];
  onRowClick: (record: TransactionRecord) => void;
}

const formatCurrency = (n: number | null) =>
  n === null
    ? "—"
    : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const statusConfig: Record<string, { label: string; className: string }> = {
  matched:   { label: "Matched",   className: "bg-success/10 text-success border-success/20"                  },
  unmatched: { label: "Unmatched", className: "bg-destructive/10 text-destructive border-destructive/20"      },
  partial:   { label: "Partial",   className: "bg-warning/10 text-warning border-warning/20"                  },
  adjusted:  { label: "Adjusted",  className: "bg-primary/10 text-primary border-primary/20"                  },
};

const rowBgMap: Record<string, string> = {
  unmatched: "bg-destructive/5",
  partial:   "bg-warning/5",
};

export function AuditTable({ records, onRowClick }: AuditTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;
    const rows = tableRef.current.querySelectorAll("tbody tr");
    gsap.fromTo(rows, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" });
  }, [records]);

  return (
    <div ref={tableRef} className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-mono text-xs">ID</TableHead>
            <TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs">Description</TableHead>
            <TableHead className="text-right text-xs">System Amount</TableHead>
            <TableHead className="text-right text-xs">Gateway Amount</TableHead>
            <TableHead className="text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => {
            const config = statusConfig[r.matchStatus];
            return (
              <TableRow
                key={r.id}
                className={cn("cursor-pointer transition-colors hover:bg-accent/50", rowBgMap[r.matchStatus])}
                onClick={() => onRowClick(r)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                <TableCell className="font-mono text-xs">{r.date}</TableCell>
                <TableCell className="text-sm max-w-[300px] truncate">{r.description}</TableCell>
                <TableCell className={cn("text-right font-mono text-sm", r.systemAmount < 0 ? "text-destructive" : "text-card-foreground")}>
                  {formatCurrency(r.systemAmount)}
                </TableCell>
                <TableCell className={cn(
                  "text-right font-mono text-sm",
                  r.gatewayAmount === null ? "text-muted-foreground"
                  : r.gatewayAmount < 0   ? "text-destructive"
                  : "text-card-foreground"
                )}>
                  {formatCurrency(r.gatewayAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", config.className)}>{config.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}