import { AmenityResponse } from "./api-client"

// Listing Types
export type ListingStatus =
  | "draft"
  | "pending_ai_review"
  | "ai_rejected"
  | "pending_staff_review"
  | "staff_rejected"
  | "published"
  | "paused"
  | "sold"

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "land"
  | "office"
  | "commercial"

export type TransactionType = "sale" | "rental"

export interface Location {
  countryId: string
  provinceId: string
  wardId: string
  address: string
  city: string
  district: string
  ward: string
  lat: number
  lng: number
}

export interface Image {
  id: string
  url: string
  thumbnailUrl: string
  alt: string
  isCover: boolean
  order: number
}

export interface Video {
  id: string
  url: string
  thumbnailUrl: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "seller" | "buyer" | "staff" | "admin"
  avatar?: string
  phone?: string
  type?: "owner" | "broker"
}

export interface Listing {
  id: string
  title: string
  description: string
  propertyType: PropertyType
  transactionType: TransactionType
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  location: Location
  images: Image[]
  videos: Video[]
  amenities: AmenityResponse[]
  features: string[]
  status: ListingStatus
  sellerId: string
  seller: User
  views: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  yearBuilt?: number
  floor?: number
  direction?: string
  legalStatus?: string
}

export interface ListingStats {
  total: number
  published: number
  pending: number
  rejected: number
  draft: number
}

// Review Types
export type Priority = "high" | "medium" | "low"

export interface ReviewListing {
  id: string
  title: string
  seller: {
    name: string
    type: "individual" | "broker"
  }
  priority: Priority
  waitTime: number
  submittedAt: string
  assignedTo?: string
  propertyType: PropertyType
  price: number
  thumbnailUrl?: string
}

export interface AICheck {
  type: "image_quality" | "duplicate" | "price_anomaly" | "content_policy"
  status: "pass" | "fail" | "warning"
  confidence: number
  details: string
}

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  required: boolean
}

export interface StaffStats {
  totalQueue: number
  assignedToMe: number
  reviewedToday: number
  avgReviewTime: string
}

// Feedback Types
export type FeedbackCategory =
  | "images"
  | "description"
  | "price"
  | "legal"
  | "data"

export type FeedbackSeverity = "error" | "warning" | "info"

export interface FeedbackItem {
  id: string
  category: FeedbackCategory
  field: string
  severity: FeedbackSeverity
  message: string
  suggestedAction: string
  affectedField?: string
}

export interface FeedbackReport {
  id: string
  listingId: string
  items: FeedbackItem[]
  createdAt: string
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface ListingFilters {
  page?: number
  pageSize?: number
  status?: ListingStatus
  search?: string
  sortBy?: "createdAt" | "price" | "views"
  sortOrder?: "asc" | "desc"
}



export interface Country {
  countryId: string
  name: string
  code: string;
}

export interface Province  {
  provinceId: string
  name: string
  countryId: string;
}

export interface Ward {
  wardId: string
  name: string
  provinceId: string;
}


export interface Listing {
  id: string
  title: string
  description: string
  propertyType: PropertyType
  listingType: string
  price: number
  areaSqm: number
  bedrooms: number
  bathrooms: number
  floorNumber?: number
  yearBuilt?: number
  direction?: string
  legalStatus?: string
  furnitureStatus?: string
  status: ListingStatus
  mediaType: "photos_only" | "photos_and_tour"
  createdAt: string
  updatedAt: string
  location: Location
  images: Image[]
  amenities: AmenityResponse[]
  features: string[]
  seller: User
}