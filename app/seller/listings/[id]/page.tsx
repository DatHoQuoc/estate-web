"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
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
import { getListingDetails } from "@/lib/api-client"
import type { Listing } from "@/lib/types"

export default function ListingDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const listingId = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getListingDetails(listingId)
      .then((data) => {
        if (!isMounted) return
        setListing(data)
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
          <p className="text-sm text-muted-foreground">{error || "We couldn’t find this listing."}</p>
          <Button onClick={() => navigate("/seller")}>Back to dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/seller")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ImageGallery
                images={listing.images}
                coverImageIndex={listing.images.findIndex((img) => img.isCover)}
              />

              {/* Property Header */}
              <PropertyHeader
                listing={listing}
                isOwner={true}
                onEdit={handleEdit}
              />

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

              {/* Location Map Placeholder */}
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

            {/* Sidebar */}
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
