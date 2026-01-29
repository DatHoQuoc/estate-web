"use client"

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertBannerProps {
  variant: "info" | "warning" | "error" | "success"
  title: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
}

const variantConfig = {
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800",
    iconClassName: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-amber-50 border-amber-200 text-amber-800",
    iconClassName: "text-amber-500",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200 text-red-800",
    iconClassName: "text-red-500",
  },
  success: {
    icon: CheckCircle,
    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    iconClassName: "text-emerald-500",
  },
}

export function AlertBanner({
  variant,
  title,
  message,
  dismissible,
  onDismiss,
}: AlertBannerProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex gap-3",
        config.className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconClassName)} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm mt-1 opacity-90">{message}</p>
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -mt-1 -mr-1 opacity-70 hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
