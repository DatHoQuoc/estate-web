"use client"

import { Check, MapPin, Bed, Bath, Square, Calendar, Compass, FileText, Phone, Mail, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/common/status-badge"
import type { Listing, User } from "@/lib/types"
import { AmenityResponse } from "@/lib/api-client"

interface PropertyHeaderProps {
  listing: Listing
  isOwner?: boolean
  onEdit?: () => void
}

export function PropertyHeader({ listing, isOwner, onEdit }: PropertyHeaderProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={listing.status} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {listing.title}
          </h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-2">
            <MapPin className="h-4 w-4" />
            {listing.location.address}, {listing.location.city}
          </p>
        </div>
        {isOwner && onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit Listing
          </Button>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">
          {formatPrice(listing.price)}
        </span>
        {listing.transactionType === "rental" && (
          <span className="text-muted-foreground">/month</span>
        )}
      </div>
    </div>
  )
}

interface PropertySpecsProps {
  listing: Listing
}

export function PropertySpecs({ listing }: PropertySpecsProps) {
  const specs = [
    { icon: Square, label: "Area", value: `${listing.area} m²` },
    { icon: Bed, label: "Bedrooms", value: listing.bedrooms },
    { icon: Bath, label: "Bathrooms", value: listing.bathrooms },
    ...(listing.floor ? [{ icon: FileText, label: "Floor", value: listing.floor }] : []),
    ...(listing.direction ? [{ icon: Compass, label: "Direction", value: listing.direction }] : []),
    ...(listing.yearBuilt ? [{ icon: Calendar, label: "Year Built", value: listing.yearBuilt }] : []),
  ]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <spec.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{spec.label}</p>
                <p className="font-medium">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface AmenitiesListProps {
  amenities: AmenityResponse[]
  features: string[]
}

const amenityLabels: Record<string, string> = {
  Pool: "Swimming Pool",
  Gym: "Gym / Fitness",
  Parking: "Parking",
  Security: "24/7 Security",
  Elevator: "Elevator",
  Garden: "Garden",
  Balcony: "Balcony",
}

export function AmenitiesList({ amenities, features }: AmenitiesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Amenities & Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {amenities.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">AMENITIES</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <div key={amenity.amenityId} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">{amenityLabels[amenity.amenityId] || amenity.amenityName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">FEATURES</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ContactCardProps {
  seller: User
  onMessage?: () => void
  onCall?: () => void
}

export function ContactCard({ seller, onMessage, onCall }: ContactCardProps) {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg">Contact Seller</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={seller.avatar || "/placeholder.svg"} alt={seller.name} />
            <AvatarFallback>
              {seller.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{seller.name}</p>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {seller.type === "owner" ? "Owner" : "Broker"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={onCall}>
            <Phone className="mr-2 h-4 w-4" />
            Call Now
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={onMessage}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Send Message
          </Button>
          {seller.email && (
            <Button variant="ghost" className="w-full" asChild>
              <a href={`mailto:${seller.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                {seller.email}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
