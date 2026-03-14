import { cn } from "@/lib/utils"
import type { ListingStatus, Priority } from "@/lib/types"

interface StatusBadgeProps {
  status: ListingStatus
  className?: string
}

const statusConfig: Record<ListingStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    className: "bg-blue-500/15 text-blue-700",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-500/15 text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-muted text-muted-foreground",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-destructive/15 text-destructive",
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
