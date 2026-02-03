// pages/staff/review-detail.tsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Download } from "lucide-react"
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
import { ReviewHistoryTimeline } from "@/components/staff/review-history-timeline"
import { SellerContactInfo } from "@/components/staff/seller-contact-info"
import { ReviewTimer } from "@/components/staff/review-timer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { mockStaffUser, mockChecklist } from "@/lib/mock-data"
import type { ChecklistItem, AICheck, Listing } from "@/lib/types"
import type { FeedbackResponse } from "@/lib/report-service-type"
import type { ReviewHistoryItem } from "@/lib/api-client"
import { getFeedbackByListing } from "@/lib/report-service-api"
import {
  getListingDetails,
  approveListing,
  requestEditListing,
  rejectListing,
  getReviewHistory,
  saveStaffNotes,
  updateChecklist,
  getAllListingAmenities,
} from "@/lib/api-client"
import { getListingImages, getListingVideos } from "@/lib/api-client"
import TourEditorPage from '@app/seller/listings/[id]/edit/tour-editor'

function mapFeedbackToAIChecks(feedbacks: FeedbackResponse[]): AICheck[] {
  const checkTypeMap: Record<string, AICheck["type"]> = {
    IMAGE_QUALITY: "image_quality",
    DUPLICATE: "duplicate",
    PRICE_ANOMALY: "price_anomaly",
    CONTENT_POLICY: "content_policy",
  }

  const statusMap: Record<string, AICheck["status"]> = {
    APPROVED: "pass",
    REJECTED: "fail",
    PENDING_REVIEW: "warning",
  }

  return feedbacks.map((feedback) => ({
    type: checkTypeMap[feedback.checkType] || "content_policy",
    status: statusMap[feedback.feedbackStatus] || "warning",
    confidence: Math.round(feedback.aiConfidenceScore * 100),
    details:
      feedback.feedbackItems
        .map((item) => `${item.errorMessage}\nSuggestion: ${item.suggestion}`)
        .join("\n\n") || "No details available",
  }))
}

export default function StaffReviewDetailPage() {
  const params = useParams()
  const navigate = useNavigate()

  const listingId = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(mockChecklist)
  const [staffNotes, setStaffNotes] = useState("")
  const [checks, setChecks] = useState<AICheck[]>([])
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const [listingData, feedbacks, images] = await Promise.all([
          getListingDetails(listingId),
          getFeedbackByListing("c3456789-3333-4ef8-bb6d-6bb9bd380a33"),
          //getReviewHistory(listingId),
          getListingImages(listingId),
          //getListingVideos(listingId),
        ])

        const mappedAmenities = listingData.amenities
          .map(a => ({
            amenityId: a.amenityId,
            amenityName: a.amenityName,
            amenityCategory: a.amenityCategory,
            iconUrl: a.iconUrl,
          }))

        const mappedImages = images.map((img) => ({
          id: img.imageId,
          url: img.url,
          thumbnailUrl: img.url,
          alt: listingData.title,
          isCover: img.isCover,
          order: img.displayOrder,
        }))

        // const mappedVideos = videos.map((vid) => ({
        //   id: vid.videoId,
        //   url: vid.url,
        //   thumbnailUrl: "",
        //   title: "",
        //   order: vid.displayOrder,
        // }))

        setListing({
          ...listingData,
          images: mappedImages,
          amenities: mappedAmenities,
          //videos: mappedVideos,
        })

        const aiChecks = mapFeedbackToAIChecks(feedbacks)
        setChecks(aiChecks)
        //setReviewHistory(history)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to approve listing")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [listingId, toast])

  useEffect(() => {
    const autoSave = setTimeout(async () => {
      if (staffNotes && !saving) {
        try {
          await saveStaffNotes(listingId, staffNotes)
        } catch (error) {
          console.error("Failed to auto-save notes:", error)
        }
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [staffNotes, listingId, saving])

  const allRequiredChecked = checklist
    .filter((item) => item.required)
    .every((item) => item.checked)

  const handleCheckChange = async (id: string, checked: boolean) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === id ? { ...item, checked } : item
    )
    setChecklist(updatedChecklist)

    try {
      await updateChecklist(listingId, updatedChecklist)
    } catch (error) {
      console.error("Failed to save checklist:", error)
    }
  }

  const handleApprove = async () => {
    try {
      setSaving(true)
      //await approveListing(listingId, staffNotes, checklist)
      toast.success("Listing approved successfully")

      navigate("/staff")
    } catch (error) {
      console.error("Failed to approve:", error)
      toast.error("Failed to approve listing")

    } finally {
      setSaving(false)
    }
  }

  const handleRequestEdit = async (feedback: string) => {
    try {
      setSaving(true)
      const issues = checklist
        .filter((item) => !item.checked && item.required)
        .map((item) => item.label)

      await requestEditListing(listingId, feedback, staffNotes, issues)
      toast.success("Listing approved successfully")

      navigate("/staff")
    } catch (error) {
      console.error("Failed to request edit:", error)
      toast.error("Failed to approve listing")

    } finally {
      setSaving(false)
    }
  }

  const handleReject = async (reason: string, feedback: string) => {
    try {
      setSaving(true)
      await rejectListing(listingId, reason, feedback, staffNotes)
      toast.success("Listing approved successfully")

      navigate("/staff")
    } catch (error) {
      console.error("Failed to reject:", error)
      toast.error("Failed to approve listing")

    } finally {
      setSaving(false)
    }
  }

  const handleExportReport = () => {
    const report = {
      listingId: listing?.id,
      title: listing?.title,
      staffNotes,
      checklist,
      aiChecks: checks,
      reviewHistory,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `review-report-${listingId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={mockStaffUser} />
        <main className="pt-16 flex items-center justify-center h-screen">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockStaffUser} />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="-ml-2"
              onClick={() => navigate("/staff")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Review Queue
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {listing.createdAt && <ReviewTimer submittedAt={listing.createdAt} />}

              <ImageGallery
                images={listing.images}
                coverImageIndex={listing.images.findIndex((img) => img.isCover)}
              />
              <TourEditorPage/>
              <PropertyHeader listing={listing} isOwner={false} />

              <PropertySpecs listing={listing} />

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

              <AmenitiesList
                amenities={listing.amenities}
              />

              <Tabs defaultValue="ai-checks">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai-checks">
                    AI Checks
                    {checks.some((c) => c.status === "fail") && (
                      <Badge variant="destructive" className="ml-2">
                        {checks.filter((c) => c.status === "fail").length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    History ({reviewHistory.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ai-checks" className="mt-4">
                  <AICheckResults checks={checks} />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <ReviewHistoryTimeline history={reviewHistory} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-20 space-y-6">
                <SellerContactInfo
                  seller={{
                    id: listing.seller.id,
                    name: listing.seller.name || "Unknown Seller",
                    email: listing.seller.email || "No email",
                    phone: undefined,
                    joinedDate: undefined,
                    totalListings: undefined,
                  }}
                />

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Manual Review
                      </h3>
                      <ReviewChecklist
                        checklist={checklist}
                        onCheckChange={handleCheckChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-notes">
                        Staff Notes (Private)
                      </Label>
                      <Textarea
                        id="staff-notes"
                        placeholder="Add notes about this review..."
                        value={staffNotes}
                        onChange={(e) => setStaffNotes(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Auto-saved · Only visible to staff
                      </p>
                    </div>

                    <ReviewActionPanel
                      onApprove={handleApprove}
                      onRequestEdit={handleRequestEdit}
                      onReject={handleReject}
                      disabled={!allRequiredChecked || saving}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}