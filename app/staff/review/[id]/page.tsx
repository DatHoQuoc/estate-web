"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { ImageGallery } from "@/components/common/image-gallery"
import {
  PropertyHeader,
  PropertySpecs,
  AmenitiesList,
} from "@/components/seller/property-details"
import { AICheckResults } from "@/components/staff/ai-check-results"
import { ReviewChecklist } from "@/components/staff/review-checklist"
import { ReviewActionPanel } from "@/components/staff/review-action-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  mockStaffUser,
  mockListings,
  mockAIChecks,
  mockChecklist,
} from "@/lib/mock-data"
import type { ChecklistItem } from "@/lib/types"

export default function StaffReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.id as string

  const listing = mockListings.find((l) => l.id === listingId) || mockListings[1]
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>(mockChecklist)
  const [staffNotes, setStaffNotes] = useState("")

  const allRequiredChecked = checklist
    .filter((item) => item.required)
    .every((item) => item.checked)

  const handleCheckChange = (id: string, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    )
  }

  const handleApprove = () => {
    console.log("Approving listing:", listingId, { staffNotes })
    router.push("/staff")
  }

  const handleRequestEdit = (feedback: string) => {
    console.log("Requesting edit:", listingId, { feedback, staffNotes })
    router.push("/staff")
  }

  const handleReject = (reason: string, feedback: string) => {
    console.log("Rejecting listing:", listingId, { reason, feedback, staffNotes })
    router.push("/staff")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockStaffUser} />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => router.push("/staff")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Review Queue
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Listing Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ImageGallery
                images={listing.images}
                coverImageIndex={listing.images.findIndex((img) => img.isCover)}
              />

              {/* Property Header */}
              <PropertyHeader listing={listing} isOwner={false} />

              {/* Property Specs */}
              <PropertySpecs listing={listing} />

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <AmenitiesList
                amenities={listing.amenities}
                features={listing.features}
              />

              {/* AI Validation Results */}
              <AICheckResults checks={mockAIChecks} />
            </div>

            {/* Sidebar - Review Panel */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-20 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Manual Review</h3>
                  <ReviewChecklist
                    checklist={checklist}
                    onCheckChange={handleCheckChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-notes">Staff Notes (Private)</Label>
                  <Textarea
                    id="staff-notes"
                    placeholder="Add notes about this review..."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    These notes are only visible to staff members.
                  </p>
                </div>

                <ReviewActionPanel
                  onApprove={handleApprove}
                  onRequestEdit={handleRequestEdit}
                  onReject={handleReject}
                  disabled={!allRequiredChecked}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
