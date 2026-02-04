// components/staff/review-history-timeline.tsx
"use client"

import { Clock, CheckCircle, XCircle, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReviewHistoryItem } from "@/lib/api-client"

interface ReviewHistoryTimelineProps {
  history: ReviewHistoryItem[]
}

export function ReviewHistoryTimeline({ history }: ReviewHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No previous reviews</p>
        </CardContent>
      </Card>
    )
  }

  const getIcon = (action: ReviewHistoryItem["action"]) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "edit_requested":
        return <Edit className="h-5 w-5 text-orange-500" />
    }
  }

  const getActionText = (action: ReviewHistoryItem["action"]) => {
    switch (action) {
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "edit_requested":
        return "Edit Requested"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={item.reviewId} className="flex gap-3">
              <div className="flex flex-col items-center">
                {getIcon(item.action)}
                {index < history.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{getActionText(item.action)}</span>
                  <span className="text-xs text-muted-foreground">
                    by {item.staffName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <Clock className="h-3 w-3" />
                  {new Date(item.timestamp).toLocaleString()}
                </p>
                {item.notes && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {item.notes}
                  </p>
                )}
                {item.feedback && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded mt-2">
                    Feedback: {item.feedback}
                  </p>
                )}
                {item.reason && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                    Reason: {item.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}