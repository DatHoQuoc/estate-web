import React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: {
    value: number
    direction: "up" | "down"
  }
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-blue-500/10 text-blue-600",
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className="min-w-[200px]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "p-2.5 rounded-lg",
              variantStyles[variant]
            )}
          >
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                trend.direction === "up"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}
