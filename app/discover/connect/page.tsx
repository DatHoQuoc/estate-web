"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BrokerConnectForm } from "@/components/buyer/broker-connect"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPublishedListingDetails, listPublishedListings } from "@/lib/api-client"
import type { Listing } from "@/lib/types"

export default function ConnectPage() {
  const [params] = useSearchParams()
  const listingId = params.get("listingId")
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const load = async () => {
      try {
        let data: Listing | null = null
        if (listingId) {
          data = await getPublishedListingDetails(listingId)
        } else {
          const listings = await listPublishedListings(0, 1)
          data = listings[0] || null
        }

        if (!mounted) return
        setListing(data)
        setError(data ? null : "No listing is available for broker handoff")
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : "Failed to load listing")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [listingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-6 max-w-5xl mx-auto px-4 py-10">
          <p className="text-sm text-muted-foreground">Loading listing...</p>
        </main>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-6 max-w-5xl mx-auto px-4 py-10 space-y-4">
          <p className="text-sm text-destructive">{error || "Listing not found"}</p>
          <Button variant="outline" onClick={() => navigate("/discover/map")}>Back to map</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
            <main className="pt-6 max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">Broker Connection</p>
            <h1 className="text-3xl font-bold text-foreground">Hand off to a broker in one step</h1>
            <p className="text-muted-foreground">We keep your search context, listing, and preferences attached to this request.</p>
          </div>
          <Button variant="ghost" onClick={() => navigate(`/discover/listings/${listing.id}`)}>View listing</Button>
        </div>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-4 flex gap-4 items-center">
            {listing.images?.[0] && (
              <img
                src={listing.images[0].thumbnailUrl || listing.images[0].url}
                alt={listing.title}
                className="h-20 w-28 object-cover rounded-md"
              />
            )}
            <div>
              <p className="text-sm text-muted-foreground">Selected listing</p>
              <p className="font-semibold text-foreground">{listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {typeof listing.price === "number"
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    }).format(listing.price)
                  : "Contact for price"}{" "}
                • {listing.propertyType}
              </p>
            </div>
          </CardContent>
        </Card>

        <BrokerConnectForm
          listing={listing}
          onSubmit={() => navigate("/discover/assistant")}
        />
      </main>
    </div>
  )
}
