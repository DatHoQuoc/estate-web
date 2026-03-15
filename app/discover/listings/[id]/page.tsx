"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Home,
  Clock3,
  Globe2,
  Waves,
  Dumbbell,
  Car,
  Shield,
  Trees,
  Building2,
  Sparkles,
  CalendarClock,
  Compass,
  FileCheck2,
  Layers3,
  Sofa,
  MessageCircle,
  PhoneCall,
  Eye,
  CheckCircle2,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { ImageGallery } from "@/components/common/image-gallery"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getCountries,
  getProvinces,
  getWards,
  getVirtualTour,
  getListingViewStats,
  getPublishedListingDetails,
  getPublicUserProfile,
  recordListingView,
} from "@/lib/api-client"
import type { Listing } from "@/lib/types"
import type { TourSceneResponse, PublicUserProfileResponse } from "@/lib/api-client"
import { VirtualTourPreview } from "@/components/virtual-tour/VirtualTourPreview"

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  pool: Waves,
  swimming: Waves,
  gym: Dumbbell,
  fitness: Dumbbell,
  parking: Car,
  security: Shield,
  garden: Trees,
  elevator: Building2,
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const sanitizeLocationPart = (value?: string) => {
  if (!value || UUID_PATTERN.test(value)) return ""
  return value
}

const getAmenityIcon = (amenityName: string, amenityCategory?: string) => {
  const key = `${amenityName} ${amenityCategory || ""}`.toLowerCase()
  const iconKey = Object.keys(AMENITY_ICON_MAP).find((k) => key.includes(k))
  return iconKey ? AMENITY_ICON_MAP[iconKey] : Sparkles
}

const toTitleFromEnum = (value?: string, fallback = "Listing") => {
  if (!value) return fallback
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function ListingDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [viewTotal, setViewTotal] = useState<number | null>(null)
  const [tourScenes, setTourScenes] = useState<TourSceneResponse[]>([])
  const [sellerProfile, setSellerProfile] = useState<PublicUserProfileResponse | null>(null)
  const [locationNames, setLocationNames] = useState<{
    ward?: string
    province?: string
    country?: string
  }>({})
  const [tourLoading, setTourLoading] = useState(false)
  const [showTourFullscreen, setShowTourFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const listingArea = listing?.area || (listing as any)?.areaSqm || 0

  const locationLabel = useMemo(() => {
    if (!listing) return ""

    const wardName = locationNames.ward || sanitizeLocationPart(listing.location?.ward)
    const provinceName = locationNames.province || sanitizeLocationPart(listing.location?.district)
    const countryName = locationNames.country || sanitizeLocationPart(listing.location?.city)

    return [
      listing.location?.address,
      wardName,
      provinceName,
      countryName,
    ]
      .filter(Boolean)
      .join(", ")
  }, [listing, locationNames])

  const formattedPrice = useMemo(() => {
    if (!listing || typeof listing.price !== "number") return "Contact for price"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(listing.price)
  }, [listing])

  const pricePerSqm = useMemo(() => {
    if (!listing || !listing.price || !listingArea) return null
    return Math.round(listing.price / listingArea)
  }, [listing, listingArea])

  const factRows = useMemo(() => {
    if (!listing) return []

    const rows: Array<{ icon: LucideIcon; label: string; value: string }> = [
      {
        icon: Home,
        label: "Property Type",
        value: toTitleFromEnum(listing.propertyType, "Property"),
      },
      {
        icon: Maximize2,
        label: "Land Area",
        value: listingArea ? `${listingArea} m2` : "Updating",
      },
      {
        icon: Bed,
        label: "Bedrooms",
        value: listing.bedrooms ? `${listing.bedrooms} rooms` : "Not specified",
      },
      {
        icon: Bath,
        label: "Bathrooms",
        value: listing.bathrooms ? `${listing.bathrooms} rooms` : "Not specified",
      },
    ]

    if ((listing as any).furnitureStatus) {
      rows.push({
        icon: Sofa,
        label: "Furniture",
        value: String((listing as any).furnitureStatus),
      })
    }

    if ((listing as any).direction || listing.direction) {
      rows.push({
        icon: Compass,
        label: "Main Direction",
        value: String((listing as any).direction || listing.direction),
      })
    }

    if ((listing as any).legalStatus || listing.legalStatus) {
      rows.push({
        icon: FileCheck2,
        label: "Legal Status",
        value: String((listing as any).legalStatus || listing.legalStatus),
      })
    }

    if ((listing as any).floorNumber) {
      rows.push({
        icon: Layers3,
        label: "Floor",
        value: String((listing as any).floorNumber),
      })
    }

    if (listing.yearBuilt || (listing as any).yearBuilt) {
      rows.push({
        icon: CalendarClock,
        label: "Year Built",
        value: String(listing.yearBuilt || (listing as any).yearBuilt),
      })
    }

    return rows
  }, [listing, listingArea])

  const resolvedSellerName = useMemo(() => {
    if (sellerProfile?.display_name) return sellerProfile.display_name

    const fullName = `${sellerProfile?.first_name || ""} ${sellerProfile?.last_name || ""}`.trim()
    if (fullName) return fullName

    if (sellerProfile?.email) return sellerProfile.email
    return listing?.seller?.name || "Seller"
  }, [sellerProfile, listing?.seller?.name])

  const resolvedSellerRole = useMemo(() => {
    const raw = listing?.seller?.type || listing?.seller?.role || "Verified account"
    return String(raw).replaceAll("_", " ")
  }, [listing?.seller?.type, listing?.seller?.role])

  const resolvedSellerAvatar = useMemo(() => {
    return sellerProfile?.avatar_url || listing?.seller?.avatar || null
  }, [sellerProfile?.avatar_url, listing?.seller?.avatar])

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
    setSellerProfile(null)
    setLocationNames({})

    setLoading(true)
    getPublishedListingDetails(id)
      .then((data) => {
        if (!mounted) return
        setListing(data)
        setError(null)

        const countryId = data.location?.countryId
        const provinceId = data.location?.provinceId
        const wardId = data.location?.wardId

        const countryNamePromise = countryId
          ? getCountries()
              .then((countries) => countries.find((country) => country.countryId === countryId)?.name || "")
              .catch(() => "")
          : Promise.resolve("")

        const provinceNamePromise = countryId && provinceId
          ? getProvinces(countryId)
              .then((provinces) => provinces.find((province) => province.provinceId === provinceId)?.name || "")
              .catch(() => "")
          : Promise.resolve("")

        const wardNamePromise = provinceId && wardId
          ? getWards(provinceId)
              .then((wards) => wards.find((ward) => ward.wardId === wardId)?.name || "")
              .catch(() => "")
          : Promise.resolve("")

        Promise.all([wardNamePromise, provinceNamePromise, countryNamePromise]).then(
          ([ward, province, country]) => {
            if (!mounted) return
            setLocationNames({
              ward: ward || undefined,
              province: province || undefined,
              country: country || undefined,
            })
          },
        )

        const sellerId = data.sellerId || data.seller?.id
        if (sellerId) {
          getPublicUserProfile(sellerId)
            .then((profile) => {
              if (!mounted) return
              setSellerProfile(profile)
            })
            .catch(() => {
              if (!mounted) return
              setSellerProfile(null)
            })
        } else {
          setSellerProfile(null)
        }

        setTourLoading(true)
        getVirtualTour(id)
          .then((tour) => {
            if (!mounted) return
            setTourScenes(tour.scenes || [])
          })
          .catch(() => {
            if (!mounted) return
            setTourScenes([])
          })
          .finally(() => {
            if (mounted) setTourLoading(false)
          })
      })
      .catch((err) => {
        if (!mounted) return
        setError(err instanceof Error ? err.message : "Failed to load listing")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    recordListingView(id).catch(() => {
      // Keep page usable even when analytics tracking fails.
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
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <main className="pt-6 max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to search
          </Button>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => navigate(`/discover/assistant?listingId=${listing.id}`)}
            >
              Ask AI
            </Button>
            <Button className="rounded-full" onClick={() => navigate(`/discover/connect?listingId=${listing.id}`)}>
              Connect now
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
          <section className="space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-card border-border/80">
                {toTitleFromEnum((listing as any).transactionType || (listing as any).listingType)}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{listing.title}</h1>
              <p className="text-muted-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <span>{locationLabel}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-card">
                  {toTitleFromEnum(listing.propertyType, "Property")}
                </Badge>
                <Badge variant="outline" className="bg-card">{listing.status}</Badge>
                <Badge variant="outline" className="bg-card">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  {viewTotal ?? listing.views ?? 0} views in 7d
                </Badge>
              </div>
            </div>

            <ImageGallery images={listing.images} />

            <Card className="border-border/70 shadow-sm">
              <CardContent className="pt-6 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Listing Price</p>
                    <p className="text-3xl font-bold text-rose-600">{formattedPrice}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-muted/50 px-3 py-1">
                      <Bed className="h-3.5 w-3.5 mr-1" /> {listing.bedrooms || "-"} beds
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50 px-3 py-1">
                      <Bath className="h-3.5 w-3.5 mr-1" /> {listing.bathrooms || "-"} baths
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50 px-3 py-1">
                      <Maximize2 className="h-3.5 w-3.5 mr-1" /> {listingArea || "-"} m2
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="py-4 border-border/70 bg-muted/20 shadow-none">
                    <CardContent className="px-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Price per m2</p>
                      <p className="text-sm font-semibold text-foreground">
                        {pricePerSqm
                          ? `${new Intl.NumberFormat("vi-VN").format(pricePerSqm)} VND`
                          : "Updating"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="py-4 border-border/70 bg-muted/20 shadow-none">
                    <CardContent className="px-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Last updated</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(listing.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="py-4 border-border/70 bg-muted/20 shadow-none">
                    <CardContent className="px-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Published date</p>
                      <p className="text-sm font-semibold text-foreground">
                        {listing.publishedAt
                          ? new Date(listing.publishedAt).toLocaleDateString()
                          : new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Property Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
                  {factRows.map((fact) => {
                    const Icon = fact.icon
                    return (
                      <div key={fact.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 px-4 py-3 text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {fact.label}
                        </span>
                        <span className="text-foreground font-medium text-right">{fact.value}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Listing Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
                  {listing.description || "No description provided by the seller."}
                </p>

                {!!listing.features?.length && (
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="bg-muted/40 border-border/70">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.amenities?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity) => {
                      const AmenityIcon = getAmenityIcon(amenity.amenityName, amenity.amenityCategory)
                      return (
                        <Badge
                          key={amenity.amenityId}
                          variant="outline"
                          className="gap-1.5 bg-muted/30 border-border/70 px-3 py-1"
                        >
                          <AmenityIcon className="h-3.5 w-3.5 text-primary" />
                          {amenity.amenityName}
                        </Badge>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No amenities were provided for this listing.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Globe2 className="h-5 w-5 text-emerald-600" />
                    Virtual Tour
                  </span>
                  {tourScenes.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={() => setShowTourFullscreen(true)}>
                      Open Fullscreen
                    </Button>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tourLoading ? (
                  <p className="text-sm text-muted-foreground">Loading virtual tour...</p>
                ) : tourScenes.length > 0 ? (
                  <VirtualTourPreview
                    scenes={tourScenes}
                    initialSceneIndex={0}
                    fullscreen={false}
                    height="420px"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">This listing does not have a virtual tour yet.</p>
                )}
              </CardContent>
            </Card>

            <div className="md:hidden flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => navigate(`/discover/assistant?listingId=${listing.id}`)}>
                Ask AI
              </Button>
              <Button className="w-full" onClick={() => navigate(`/discover/connect?listingId=${listing.id}`)}>
                Connect
              </Button>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-20">
            <Card className="border-border/70 shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {resolvedSellerAvatar ? (
                      <img
                        src={resolvedSellerAvatar}
                        alt={resolvedSellerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{resolvedSellerName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {resolvedSellerRole}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="justify-center py-1.5 bg-muted/40 border-border/70">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Verified
                  </Badge>
                  <Badge variant="outline" className="justify-center py-1.5 bg-muted/40 border-border/70">
                    <Clock3 className="h-3.5 w-3.5 mr-1" />
                    Active listing
                  </Badge>
                </div>

                <Button className="w-full" onClick={() => navigate(`/discover/connect?listingId=${listing.id}`)}>
                  <PhoneCall className="h-4 w-4 mr-2" /> Show contact
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/discover/connect?listingId=${listing.id}`)}>
                  <MessageCircle className="h-4 w-4 mr-2" /> Chat with seller
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{listing.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Views (7 days)</span>
                  <span className="font-medium">{viewTotal ?? listing.views ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{new Date(listing.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {showTourFullscreen && tourScenes.length > 0 ? (
          <VirtualTourPreview
            scenes={tourScenes}
            initialSceneIndex={0}
            fullscreen={true}
            onClose={() => setShowTourFullscreen(false)}
          />
        ) : null}
      </main>
    </div>
  )
}
