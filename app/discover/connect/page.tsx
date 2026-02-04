"use client"

import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BrokerConnectForm } from "@/components/buyer/broker-connect"
import { mockListings, mockUser } from "@/lib/mock-data"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ConnectPage() {
  const [params] = useSearchParams()
  const listingId = params.get("listingId")
  const navigate = useNavigate()
  const listing = useMemo(() => mockListings.find((l) => l.id === listingId) || mockListings[0], [listingId])

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      <main className="pt-16 max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">Screen 5 • Broker connection</p>
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
              <p className="text-sm text-muted-foreground">${listing.price?.toLocaleString()} • {listing.propertyType}</p>
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
