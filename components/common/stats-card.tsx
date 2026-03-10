import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: "bg-primary/10 text-primary ring-1 ring-primary/20",
  success: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
  danger: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  info: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className="min-w-50 p-0 overflow-hidden border-border/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300", variantStyles[variant])}>
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm",
                trend.direction === "up"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend.value}%
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-muted-foreground tracking-tight">{title}</p>
        <p className="mt-1 text-3xl font-bold text-foreground tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
