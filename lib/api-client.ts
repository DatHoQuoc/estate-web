import type { Listing } from "@/lib/types"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080"

interface ApiListingResponse {
  listingId: string
  userId?: string
  title: string
  description: string
  listingType?: string
  propertyType?: string
  status?: string
  isFreePost?: boolean
  price?: number
  priceCurrency?: string
  pricePeriod?: string
  negotiable?: boolean
  areaSqm?: number
  bedrooms?: number
  bathrooms?: number
  floors?: number
  floorNumber?: number
  yearBuilt?: number
  wardId?: string
  provinceId?: string
  countryId?: string
  streetAddress?: string
  buildingName?: string
  latitude?: number
  longitude?: number
  featuredImageUrl?: string
  viewCount?: number
  saveCount?: number
  contactCount?: number
  createdAt?: string
  updatedAt?: string
  submittedAt?: string
  publishedAt?: string
  expiredAt?: string
}

interface CreateListingPayload {
  title: string
  description: string
  listingType: string
  propertyType: string
  price: number
  priceCurrency?: string
  pricePeriod?: string
  negotiable?: boolean
  areaSqm: number
  bedrooms?: number
  bathrooms?: number
  floors?: number
  floorNumber?: number
  yearBuilt?: number
  wardId?: string
  provinceId?: string
  countryId?: string
  streetAddress?: string
  buildingName?: string
  latitude?: number
  longitude?: number
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}

function mapApiListing(listing: ApiListingResponse): Listing {
  return {
    id: listing.listingId,
    title: listing.title,
    description: listing.description,
    propertyType: (listing.propertyType as Listing["propertyType"]) || "apartment",
    transactionType: (listing.listingType as Listing["transactionType"]) || "sale",
    price: listing.price ?? 0,
    area: listing.areaSqm ?? 0,
    bedrooms: listing.bedrooms ?? 0,
    bathrooms: listing.bathrooms ?? 0,
    location: {
      address: listing.streetAddress || "",
      city: listing.provinceId || "",
      district: listing.countryId || "",
      ward: listing.wardId || "",
      lat: listing.latitude ?? 0,
      lng: listing.longitude ?? 0,
    },
    images: listing.featuredImageUrl
      ? [
          {
            id: "featured",
            url: listing.featuredImageUrl,
            thumbnailUrl: listing.featuredImageUrl,
            alt: listing.title,
            isCover: true,
            order: 0,
          },
        ]
      : [],
    videos: [],
    amenities: [],
    features: [],
    status: (listing.status as Listing["status"]) || "draft",
    sellerId: listing.userId || "",
    seller: {
      id: listing.userId || "",
      email: "",
      name: "",
      role: "seller",
    },
    views: listing.viewCount ?? 0,
    createdAt: listing.createdAt || new Date().toISOString(),
    updatedAt: listing.updatedAt || new Date().toISOString(),
    publishedAt: listing.publishedAt,
    yearBuilt: listing.yearBuilt,
    floor: listing.floorNumber,
    direction: undefined,
    legalStatus: undefined,
  }
}

export async function listSellerListings(): Promise<Listing[]> {
  const data = await fetchJson<{ content?: ApiListingResponse[]; data?: ApiListingResponse[]; items?: ApiListingResponse[] }>(
    `${API_BASE}/api/v1/seller/listings`
  )
  const items = data.content || data.data || data.items || []
  return items.map(mapApiListing)
}

export async function getListingDetails(id: string): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(`${API_BASE}/api/v1/seller/listings/${id}`)
  return mapApiListing(listing)
}

export async function createListingDraft(payload: CreateListingPayload): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(`${API_BASE}/api/v1/seller/listings`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return mapApiListing(listing)
}

export async function updateListing(id: string, payload: Partial<CreateListingPayload>): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(`${API_BASE}/api/v1/seller/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return mapApiListing(listing)
}

export async function deleteListingDraft(id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${id}`, { method: "DELETE" })
}

export async function submitListingForReview(id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${id}/submit`, { method: "PUT" })
}
