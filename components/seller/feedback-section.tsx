"use client"

import { useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  FileText,
  DollarSign,
  Shield,
  Database,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FeedbackItem, FeedbackCategory, FeedbackSeverity } from "@/lib/types"

interface FeedbackSectionProps {
  category: FeedbackCategory
  items: FeedbackItem[]
  onFixItem?: (itemId: string, field?: string) => void
}

const categoryConfig: Record<
  FeedbackCategory,
  { icon: typeof ImageIcon; label: string }
> = {
  images: { icon: ImageIcon, label: "Images" },
  description: { icon: FileText, label: "Description" },
  price: { icon: DollarSign, label: "Pricing" },
  legal: { icon: Shield, label: "Legal Information" },
  data: { icon: Database, label: "Property Data" },
}

const severityConfig: Record<
  FeedbackSeverity,
  { icon: typeof AlertCircle; className: string; bgClassName: string }
> = {
  error: {
    icon: AlertCircle,
    className: "text-red-600",
    bgClassName: "bg-red-50 border-red-200",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-amber-600",
    bgClassName: "bg-amber-50 border-amber-200",
  },
  info: {
    icon: Info,
    className: "text-blue-600",
    bgClassName: "bg-blue-50 border-blue-200",
  },
}

export function FeedbackSection({
  category,
  items,
  onFixItem,
}: FeedbackSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const config = categoryConfig[category]
  const Icon = config.icon

  const errorCount = items.filter((i) => i.severity === "error").length
  const warningCount = items.filter((i) => i.severity === "warning").length

  return (
    <Card>
      <CardHeader
        className="py-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{config.label}</h3>
              <div className="flex items-center gap-3 mt-1">
                {errorCount > 0 && (
                  <span className="text-xs text-red-600 font-medium">
                    {errorCount} error{errorCount > 1 ? "s" : ""}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="text-xs text-amber-600 font-medium">
                    {warningCount} warning{warningCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {items.map((item) => {
            const severity = severityConfig[item.severity]
            const SeverityIcon = severity.icon

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-lg border p-4",
                  severity.bgClassName
                )}
              >
                <div className="flex items-start gap-3">
                  <SeverityIcon
                    className={cn("h-5 w-5 flex-shrink-0 mt-0.5", severity.className)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.field}</p>
                    <p className="text-sm mt-1 opacity-90">{item.message}</p>

                    {/* Suggested Action */}
                    <div className="mt-3 p-3 bg-white/80 rounded-md border border-current/10">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        SUGGESTED ACTION
                      </p>
                      <p className="text-sm">{item.suggestedAction}</p>
                    </div>

                    {/* Fix Button */}
                    {onFixItem && item.affectedField && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 -ml-2 h-auto p-2"
                        onClick={() => onFixItem(item.id, item.affectedField)}
                      >
                        Go to fix
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      )}
    </Card>
  )
}
