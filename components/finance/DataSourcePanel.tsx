import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DataItem {
  label: string;
  value: number;
}

interface DataSourcePanelProps {
  title: string;
  icon: LucideIcon;
  items: DataItem[];
  total: number;
  className?: string;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export function DataSourcePanel({ title, icon: Icon, items, total, className }: DataSourcePanelProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="font-mono text-sm font-medium text-card-foreground">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-card-foreground">Total</span>
        <span className="font-mono text-lg font-bold text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
