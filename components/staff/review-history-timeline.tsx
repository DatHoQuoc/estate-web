// components/staff/review-history-timeline.tsx
"use client"

import { Clock, CheckCircle, XCircle, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ListingReviewResponse } from "@/lib/api-client"

interface ReviewHistoryTimelineProps {
  history: ListingReviewResponse[]
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

  const getIcon = (action: ListingReviewResponse["reviewAction"]) => {
    switch (action) {
      case "APPROVE":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "REJECT":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "REQUEST_CHANGES":
        return <Edit className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getActionText = (action: ListingReviewResponse["reviewAction"]) => {
    switch (action) {
      case "APPROVE":
        return "Approved"
      case "REJECT":
        return "Rejected"
      case "REQUEST_CHANGES":
        return "Edit Requested"
      default:
        return "Reviewed"
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
                {getIcon(item.reviewAction)}
                {index < history.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{getActionText(item.reviewAction)}</span>
                  <span className="text-xs text-muted-foreground">
                    by {item.reviewerRole}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <Clock className="h-3 w-3" />
                  {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : "Unknown date"}
                </p>
                {item.staffNotesInternal && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    Notes: {item.staffNotesInternal}
                  </p>
                )}
                {item.feedbackToSeller && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded mt-2">
                    Feedback: {item.feedbackToSeller}
                  </p>
                )}
                {item.rejectionReason && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                    Reason: {item.rejectionReason}
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
