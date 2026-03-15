"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, MapPin, Bed, Bath, Maximize2, ShieldCheck, Clock3 } from "lucide-react"
import { ImageGallery } from "@/components/common/image-gallery"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getListingViewStats,
  getPublishedListingDetails,
  recordListingView,
} from "@/lib/api-client"
import type { Listing } from "@/lib/types"

export default function ListingDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [viewTotal, setViewTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Listing id is missing")
      setLoading(false)
      return
    }

    let mounted = true
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - 7)

    setLoading(true)
    getPublishedListingDetails(id)
      .then((data) => {
        if (!mounted) return
        setListing(data)
        setError(null)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err instanceof Error ? err.message : "Failed to load listing")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    recordListingView(id).catch(() => {
      // The detail page should still render even if analytics tracking fails.
    })

    getListingViewStats(id, {
      accuracy: "DAY",
      from: from.toISOString(),
      to: to.toISOString(),
    })
      .then((stats) => {
        if (!mounted) return
        setViewTotal(stats.totalViews)
      })
      .catch(() => {
        if (!mounted) return
        setViewTotal(null)
      })

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-6 max-w-6xl mx-auto px-4 py-10">
          <p className="text-sm text-muted-foreground">Loading listing details...</p>
        </main>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-6 max-w-6xl mx-auto px-4 py-10 space-y-4">
          <p className="text-sm text-destructive">{error || "Listing not found"}</p>
          <Button variant="outline" onClick={() => navigate("/discover/map")}>Back to discovery</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
            <main className="pt-6 max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/discover/assistant?listingId=${listing.id}`)}>Ask AI about this</Button>
            <Button onClick={() => navigate(`/discover/connect?listingId=${listing.id}`)}>Connect with broker</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Listing Preview</p>
            <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" /> {listing.location?.address || listing.location?.district || listing.location?.city}
            </p>
          </div>

          <ImageGallery images={listing.images} />

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1 text-sm"><Bed className="h-4 w-4" /> {listing.bedrooms} beds</span>
                  <span className="flex items-center gap-1 text-sm"><Bath className="h-4 w-4" /> {listing.bathrooms} baths</span>
                  <span className="flex items-center gap-1 text-sm"><Maximize2 className="h-4 w-4" /> {listing.area || (listing as any).areaSqm} sqm</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
                <div className="flex flex-wrap gap-2">
                  {listing.features?.map((feature) => (
                    <span key={feature} className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground">{feature}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Trusted listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> ID verification complete
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" /> Recently updated: {new Date(listing.updatedAt).toLocaleDateString()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="px-2 py-1 bg-muted rounded">Status: {listing.status}</span>
                  <span className="px-2 py-1 bg-muted rounded">Type: {listing.propertyType}</span>
                  <span className="px-2 py-1 bg-muted rounded">
                    Price:{" "}
                    {typeof listing.price === "number"
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(listing.price)
                      : "Contact for price"}
                  </span>
                  <span className="px-2 py-1 bg-muted rounded">Views (7d): {viewTotal ?? listing.views ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
