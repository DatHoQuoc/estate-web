
// components/staff/review-timer.tsx
"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ReviewTimerProps {
  submittedAt: string
}

export function ReviewTimer({ submittedAt }: ReviewTimerProps) {
  const [elapsed, setElapsed] = useState("")

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date()
      const submitted = new Date(submittedAt)
      const diff = now.getTime() - submitted.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`
      } else {
        return `${minutes}m`
      }
    }

    setElapsed(calculateElapsed())
    const interval = setInterval(() => {
      setElapsed(calculateElapsed())
    }, 60000)

    return () => clearInterval(interval)
  }, [submittedAt])

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900">Pending Review</p>
            <p className="text-xs text-orange-700">{elapsed} since submission</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}