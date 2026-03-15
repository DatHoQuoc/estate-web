"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Eye, Edit } from "lucide-react"
import { AlertBanner } from "@/components/common/alert-banner"
import { FeedbackSection } from "@/components/seller/feedback-section"
import { Button } from "@/components/ui/button"
import type { FeedbackCategory, FeedbackItem, Listing } from "@/lib/types"
import { getFeedbackByListing } from "@/lib/report-service-api"
import { getListingDetails } from "@/lib/api-client"
import type { FeedbackResponse } from "@/lib/report-service-type"

const categoryMap: Record<string, FeedbackCategory> = {
  IMAGE_QUALITY: "images",
  DUPLICATE: "data",
  PRICE_ANOMALY: "price",
  CONTENT_POLICY: "description",
}

const severityMap: Record<string, FeedbackItem["severity"]> = {
  CRITICAL: "error",
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "info",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
}

export default function FeedbackPage() {
  const params = useParams()
  const navigate = useNavigate()
  const listingId = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      try {
        const [listingData, feedback] = await Promise.all([
          getListingDetails(listingId),
          getFeedbackByListing(listingId),
        ])

        if (!mounted) return
        setListing(listingData)

        const mappedItems: FeedbackItem[] = feedback.flatMap((report: FeedbackResponse) => {
          const category = categoryMap[report.checkType] || "data"

          return report.feedbackItems.map((item) => ({
            id: item.feedbackItemId,
            category,
            field: item.targetAttribute,
            severity: severityMap[item.severity] || "warning",
            message: item.errorMessage,
            suggestedAction: item.suggestion,
            affectedField: item.targetAttribute,
          }))
        })

        setFeedbackItems(mappedItems)
        setError(null)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : "Failed to load feedback")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [listingId])

  const feedbackByCategory = useMemo(() => {
    return feedbackItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<FeedbackCategory, FeedbackItem[]>)
  }, [feedbackItems])

  const errorCount = feedbackItems.filter((i) => i.severity === "error").length
  const warningCount = feedbackItems.filter((i) => i.severity === "warning").length

  const handleFixItem = (itemId: string, field?: string) => {
    navigate(`/seller/listings/${listingId}/edit?focus=${field}`)
  }

  const handleViewListing = () => {
    navigate(`/seller/listings/${listingId}`)
  }

  const handleFixAndResubmit = () => {
    navigate(`/seller/listings/${listingId}/edit`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading feedback...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{error || "Listing feedback unavailable."}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
            <main className="pt-6">
        <div className="max-w-6xl mx-auto py-6 px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/seller")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              AI Review Feedback
            </h1>
            <p className="text-muted-foreground mt-1">
              Review the issues found in your listing: {listing.title}
            </p>
          </div>

          {/* Alert Banner */}
          <div className="mb-6">
            <AlertBanner
              variant="error"
              title="Your listing needs attention"
              message={`AI has detected ${errorCount} error${errorCount > 1 ? "s" : ""} and ${warningCount} warning${warningCount > 1 ? "s" : ""} that need to be addressed before your listing can be reviewed by our staff.`}
            />
          </div>

          {/* Feedback Sections */}
          <div className="space-y-4 mb-8">
            {Object.entries(feedbackByCategory).map(([category, items]) => (
              <FeedbackSection
                key={category}
                category={category as FeedbackCategory}
                items={items}
                onFixItem={handleFixItem}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleViewListing}>
              <Eye className="mr-2 h-4 w-4" />
              View Listing
            </Button>
            <Button onClick={handleFixAndResubmit}>
              <Edit className="mr-2 h-4 w-4" />
              Fix and Resubmit
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
