"use client"

import { useParams, useRouter } from "next/navigation"
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
import { mockUser, mockListings } from "@/lib/mock-data"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.id as string

  const listing = mockListings.find((l) => l.id === listingId) || mockListings[0]

  const handleEdit = () => {
    router.push(`/seller/listings/${listingId}/edit`)
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
            onClick={() => router.push("/seller")}
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
