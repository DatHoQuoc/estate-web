"use client"

import { useState } from "react"
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Copy,
  DollarSign,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { AICheck } from "@/lib/types"

interface AICheckResultsProps {
  checks: AICheck[]
}

const checkTypeConfig: Record<
  AICheck["type"],
  { icon: typeof ImageIcon; label: string }
> = {
  image_quality: { icon: ImageIcon, label: "Image Quality" },
  duplicate: { icon: Copy, label: "Duplicate Detection" },
  price_anomaly: { icon: DollarSign, label: "Price Analysis" },
  content_policy: { icon: Shield, label: "Content Policy" },
}

const statusConfig = {
  pass: {
    icon: CheckCircle,
    className: "text-emerald-600",
    bgClassName: "bg-emerald-50",
    label: "Pass",
  },
  fail: {
    icon: AlertCircle,
    className: "text-red-600",
    bgClassName: "bg-red-50",
    label: "Fail",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-amber-600",
    bgClassName: "bg-amber-50",
    label: "Warning",
  },
}


export function AICheckResults({ checks }: AICheckResultsProps) {
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null)

  const passCount = checks.filter((c) => c.status === "pass").length
  const totalCount = checks.length
  const overallScore = Math.round((passCount / totalCount) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Validation Results</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{overallScore}%</span>
            <span className="text-sm text-muted-foreground">score</span>
          </div>
        </div>
        <Progress value={overallScore} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check) => {
          const typeConfig = checkTypeConfig[check.type]
          const status = statusConfig[check.status]
          const TypeIcon = typeConfig.icon
          const StatusIcon = status.icon
          const isExpanded = expandedCheck === check.type

          return (
            <div
              key={check.type}
              className={cn("rounded-lg border overflow-hidden", status.bgClassName)}
            >
              <button
                type="button"
                className="w-full p-3 flex items-center justify-between hover:bg-black/5 transition-colors"
                onClick={() =>
                  setExpandedCheck(isExpanded ? null : check.type)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/80">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-sm">{typeConfig.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={cn("h-4 w-4", status.className)} />
                    <span className={cn("text-sm font-medium", status.className)}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {check.confidence}% confidence
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3">
                  <p className="text-sm text-muted-foreground bg-white/80 p-3 rounded-md">
                    {check.details}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
