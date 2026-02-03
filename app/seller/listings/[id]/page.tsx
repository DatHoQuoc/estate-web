"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit, Globe } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { ImageGallery } from "@/components/common/image-gallery"
import {
  PropertyHeader,
  PropertySpecs,
  AmenitiesList,
  ContactCard,
} from "@/components/seller/property-details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockUser } from "@/lib/mock-data"
import { getListingDetails, getVirtualTour } from "@/lib/api-client"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ListingDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const listingId = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [tourSceneCount, setTourSceneCount] = useState(0)
  const [tourPublished, setTourPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    Promise.all([
      getListingDetails(listingId),
      getListingDetails(listingId).then((data) => {
        if (data.mediaType === "photos_and_tour") {
          return getVirtualTour(listingId)
        }
        return null
      })
    ])
      .then(([listingData, tourData]) => {
        if (!isMounted) return
        setListing(listingData)
        if (tourData) {
          setTourSceneCount(tourData.scenes.length)
          setTourPublished(tourData.isPublished)
        }
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        if (isMounted) setError(err.message || "Failed to load listing")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    
    return () => {
      isMounted = false
    }
  }, [listingId])

  const handleEdit = () => {
    navigate(`/seller/listings/${listingId}/edit`)
  }

  const handleEditTour = () => {
    navigate(`/seller/listings/${listingId}/tour/edit`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading listing...</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-foreground">Listing unavailable</p>
          <p className="text-sm text-muted-foreground">{error || "We couldn't find this listing."}</p>
          <Button onClick={() => navigate("/seller")}>Back to dashboard</Button>
        </div>
      </div>
    )
  }

  const hasTour = listing.mediaType === "photos_and_tour"

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/seller")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ImageGallery
                images={listing.images}
                coverImageIndex={listing.images.findIndex((img) => img.isCover)}
              />

              {hasTour && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-5 w-5 text-emerald-600" />
                        Virtual Tour
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditTour}
                      >
                        <Edit className="mr-2 h-3.5 w-3.5" />
                        Edit Tour
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">
                          360° Tour Preview
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium",
                            tourPublished
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {tourPublished ? "🟢 Published" : "🟡 Draft"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {tourSceneCount} scene{tourSceneCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <PropertyHeader
                listing={listing}
                isOwner={true}
                onEdit={handleEdit}
              />

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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        {listing.location.address}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {listing.location.district}, {listing.location.city}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <ContactCard
                seller={listing.seller}
                onCall={() => console.log("Call")}
                onMessage={() => console.log("Message")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}