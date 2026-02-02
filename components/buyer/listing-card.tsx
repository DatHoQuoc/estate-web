"use client"

import { Bed, Bath, MapPin, Sparkles, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ListingCardProps {
  listing: Listing
  onView?: (id: string) => void
  onConnect?: (id: string) => void
  onAskAI?: (id: string) => void
  highlight?: boolean
}

function formatPrice(value?: number) {
  if (!value && value !== 0) return "Contact for price"
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${value.toLocaleString()}`
  return `$${value}`
}

export function ListingCard({ listing, onView, onConnect, onAskAI, highlight }: ListingCardProps) {
  const cover = listing.images?.find((img) => img.isCover) || listing.images?.[0]

  return (
    <Card className={cn("overflow-hidden border-border", highlight && "ring-2 ring-primary/60")}> 
      {cover && (
        <div className="relative aspect-video">
          <img
            src={cover.url}
            alt={cover.alt || listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/90 text-foreground capitalize">
              {listing.propertyType}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground capitalize">
              {listing.transactionType || listing.listingType}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 text-white space-y-1">
            <p className="text-lg font-semibold drop-shadow">{formatPrice(listing.price)}</p>
            <p className="text-xs text-white/80 drop-shadow flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {listing.location?.district || listing.location?.city || ""}
            </p>
          </div>
        </div>
      )}

      <CardHeader className="space-y-1">
        <CardTitle className="text-lg leading-tight text-foreground line-clamp-2">{listing.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {listing.bedrooms} bd</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {listing.bathrooms} ba</span>
          <span className="flex items-center gap-1"><Maximize2 className="h-4 w-4" /> {listing.area || (listing as any).areaSqm || 0} sqm</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {listing.features?.slice(0, 3).map((feature) => (
            <span key={feature} className="px-2 py-1 rounded-full bg-muted">{feature}</span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="flex-1" onClick={() => onView?.(listing.id)}>
            View details
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => onConnect?.(listing.id)}>
            Connect with broker
          </Button>
          <Button variant="outline" className="sm:w-auto" onClick={() => onAskAI?.(listing.id)}>
            <Sparkles className="h-4 w-4 mr-1" /> Ask AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
