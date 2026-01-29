import { cn } from "@/lib/utils"
import type { ListingStatus, Priority } from "@/lib/types"

interface StatusBadgeProps {
  status: ListingStatus
  className?: string
}

const statusConfig: Record<ListingStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  pending_ai_review: {
    label: "AI Review",
    className: "bg-amber-500/15 text-amber-700",
  },
  ai_rejected: {
    label: "AI Rejected",
    className: "bg-destructive/15 text-destructive",
  },
  pending_staff_review: {
    label: "Staff Review",
    className: "bg-blue-500/15 text-blue-700",
  },
  staff_rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive",
  },
  published: {
    label: "Published",
    className: "bg-emerald-500/15 text-emerald-700",
  },
  paused: {
    label: "Paused",
    className: "bg-muted text-muted-foreground",
  },
  sold: {
    label: "Sold",
    className: "bg-primary/15 text-primary",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: {
    label: "High",
    className: "bg-destructive/15 text-destructive",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/15 text-amber-700",
  },
  low: {
    label: "Low",
    className: "bg-emerald-500/15 text-emerald-700",
  },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
