"use client"

import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Eye, Edit } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { AlertBanner } from "@/components/common/alert-banner"
import { FeedbackSection } from "@/components/seller/feedback-section"
import { Button } from "@/components/ui/button"
import { mockUser, mockListings, mockFeedbackItems } from "@/lib/mock-data"
import type { FeedbackCategory } from "@/lib/types"

export default function FeedbackPage() {
  const params = useParams()
  const navigate = useNavigate()
  const listingId = params.id as string

  const listing = mockListings.find((l) => l.id === listingId) || mockListings[2]

  // Group feedback by category
  const feedbackByCategory = mockFeedbackItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<FeedbackCategory, typeof mockFeedbackItems>
  )

  const errorCount = mockFeedbackItems.filter((i) => i.severity === "error").length
  const warningCount = mockFeedbackItems.filter((i) => i.severity === "warning").length

  const handleFixItem = (itemId: string, field?: string) => {
    navigate(`/seller/listings/${listingId}/edit?focus=${field}`)
  }

  const handleViewListing = () => {
    navigate(`/seller/listings/${listingId}`)
  }

  const handleFixAndResubmit = () => {
    navigate(`/seller/listings/${listingId}/edit`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto py-6 px-4">
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
