import type { Listing, Country, Province, Ward } from "@/lib/types"

const API_BASE = import.meta.env.VITE_API_BASE_LISTING || "http://localhost:8080"

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
  featuredImageUrl: string
  viewCount?: number
  saveCount?: number
  contactCount?: number
  createdAt?: string
  updatedAt?: string
  submittedAt?: string
  publishedAt?: string
  expiredAt?: string
  amenities?: Array<{
    amenityId: string
    amenityName: string
    amenityCategory: string
    iconUrl: string
  }>
  imageUrls: string[]
}

export interface CreateListingPayload {
  title: string
  description: string
  listingType: string
  propertyType: string
  price: number
  priceCurrency?: string
  pricePeriod?: string
  negotiable?: boolean
  areaSqm: number
  bedrooms: number
  bathrooms: number
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

export interface AmenityResponse {
  amenityId: string;
  amenityName: string;
  amenityCategory: string;
  iconUrl: string;
}

export interface POIResponse {
  poiId: string;
  listingId: string;
  name: string;
  category: string;
  distanceMeters: number;
  latitude: number;
  longitude: number;
  createdAt: string; // OffsetDateTime arrives as an ISO string
}

export interface ReviewHistoryItem {
  reviewId: string
  action: 'approved' | 'rejected' | 'edit_requested'
  staffId: string
  staffName: string
  timestamp: string
  notes: string
  feedback?: string
  reason?: string
}

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  required: boolean
}

export enum DocumentType {
  OWNERSHIP_CERTIFICATE = "OWNERSHIP_CERTIFICATE",
  LAND_USE_CERTIFICATE = "LAND_USE_CERTIFICATE",
  BUILDING_PERMIT = "BUILDING_PERMIT",
  CONSTRUCTION_PERMIT = "CONSTRUCTION_PERMIT",
  HOUSE_CERTIFICATE = "HOUSE_CERTIFICATE",
  TRANSFER_CONTRACT = "TRANSFER_CONTRACT",
  OTHER = "OTHER"
}

export interface DocumentResponse {
  documentId: string;         // UUID
  listingId: string;          // UUID
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;           // Long
  mimeType: string;
  documentNumber: string | null;
  issueDate: string | null;   // OffsetDateTime (ISO String)
  issuingAuthority: string | null;
  expiryDate: string | null;  // OffsetDateTime (ISO String)
  verified: boolean;
  verificationNotes: string | null;
  uploadedAt: string;         // OffsetDateTime (ISO String)
  updatedAt: string;         // OffsetDateTime (ISO String)
}

export interface UploadDocumentRequest {
  documentType: DocumentType; // Match your Java Enum
  documentNumber?: string;
  issueDate?: string; // ISO String
  issuingAuthority?: string;
  expiryDate?: string; // ISO String
}

interface ImageUploadResponse {
  url: string;
  order: number;
  caption: string;
  uploadedAt: string; // OffsetDateTime serializes to a string in JSON
}

export interface TourSceneRequest {
  sceneName: string
  positionX: number
  positionY: number
  positionZ: number
  hotspotsJson: any[]
}

export interface TourResponse {
  tourId: string
  tourUrl: string
  tourProvider: string
}

export interface TourSceneResponse {
  sceneId: string
  sceneName: string
  panoramaUrl: string
  sceneOrder: number
  positionX: number
  positionY: number
  positionZ: number
  hotspotsJson: any[]
}

export interface ImageResponse {
  imageId: string
  url: string
  isCover: boolean
  displayOrder: number
}

export interface VideoResponse {
  videoId: string
  url: string
  displayOrder: number
}
export interface VirtualTourResponse {
  tourId: string;       // UUID -> string
  listingId: string;    // UUID -> string
  tourUrl: string;
  tourProvider: string;
  totalScenes: number;  // Integer -> number
  isPublished: boolean;
  createdAt: string;    // OffsetDateTime -> string (ISO Date)
  updatedAt: string;    // OffsetDateTime -> string (ISO Date)
  scenes: TourSceneResponse[];
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
       "X-User-Id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",

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

export async function fetchFormData<T>(url: string, body: FormData): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-User-Id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", 
    },
    body: body,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Upload failed with status ${res.status}`)
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
      countryId: listing.countryId || "",
      wardId: listing.wardId || "",
      provinceId: listing.provinceId || "",
      address: listing.streetAddress || "",
      city: listing.provinceId || "",
      district: listing.countryId || "",
      ward: listing.wardId || "",
      lat: listing.latitude ?? 0,
      lng: listing.longitude ?? 0,
    },
    images: (listing.imageUrls || []).map((url, index) => {
      const idMatch = url.match(/\/images\/([^.?]+)/);
      const id = idMatch ? idMatch[1] : `img-${index}`;
      
      return {
        id: id,
        url: url,
        thumbnailUrl: url,
        alt: `${listing.title} - ${index + 1}`,
        isCover: url === listing.featuredImageUrl || (index === 0 && !listing.featuredImageUrl),
        order: index,
      };
    }) ,
    videos: [],
    amenities: listing.amenities?.map(a => ({
      amenityId: a.amenityId,
      amenityName: a.amenityName,
      amenityCategory: a.amenityCategory,
      iconUrl: a.iconUrl,
    })) || [],
    listingType: "",
    mediaType: "photos_only",
    areaSqm: 0,
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
    featuredImageUrl: listing.featuredImageUrl ?? undefined
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

export async function getCountries(): Promise<Country[]> {
  return fetchJson<Country[]>(`${API_BASE}/api/v1/locations/countries`);
}

export async function getProvinces(countryId: string): Promise<Province[]> {
  return fetchJson<Province[]>(`${API_BASE}/api/v1/locations/provinces?countryId=${countryId}`);
}

export async function getWards(provinceId: string): Promise<Ward[]> {
  return fetchJson<Ward[]>(`${API_BASE}/api/v1/locations/wards?provinceId=${provinceId}`);
}

export async function getCoordinates(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
  );
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }
  return null;
}

export async function getAllListingAmenities(): Promise<AmenityResponse[]> {
  return fetchJson<AmenityResponse[]>(`${API_BASE}/api/v1/amenities`);
}

export async function getListingPOIs(listingId: string): Promise<POIResponse[]> {
  return fetchJson<POIResponse[]>(`${API_BASE}/api/v1/listings/${listingId}/pois`);
}

export async function updateListingAmenities(id: string, amenityIds: string[]): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${id}/amenities`, {
    method: "PUT",
    body: JSON.stringify(amenityIds),
  });
}

export async function uploadListingDocuments(
  listingId: string, 
  files: File[], 
  requests: UploadDocumentRequest[]
): Promise<DocumentResponse[]> {
  const formData = new FormData();
  
  files.forEach((file) => formData.append("files", file));
  
  const dataBlob = new Blob([JSON.stringify(requests)], { type: "application/json" });
  formData.append("data", dataBlob);

  return fetchFormData<DocumentResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/documents/batch`, 
    formData
  );
}

// Assuming API_BASE and fetchJson are defined elsewhere, 
// otherwise replace with simple Promise.resolve()

export async function createVirtualTour(listingId: string): Promise<{ tourId: string }> {
  const body = {
    tourUrl: "",
    tourProvider: "Internal",
  }

  const response = await fetchJson<TourResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  )

  return { tourId: response.tourId }
}
export async function addTourScene(
  listingId: string,
  file: File,
  data: TourSceneRequest
): Promise<{ sceneId: string }> {
  const formData = new FormData()

  const dataBlob = new Blob([JSON.stringify(data)], { type: "application/json" })
  formData.append("data", dataBlob)

  formData.append("file", file, file.name)

  const response = await fetchFormData<TourSceneResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes`,
    formData
  )

  return { sceneId: response.sceneId }
}
export async function updateTourScene(
  listingId: string,
  sceneId: string,
  data: TourSceneRequest
): Promise<TourSceneResponse> {
  return fetchJson<TourSceneResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes/${sceneId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
}



export async function reorderTourScenes(listingId: string, sceneIds: string[]): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes/reorder`,
    {
      method: "PUT",
      body: JSON.stringify(sceneIds),
    }
  )
}

export async function publishTour(listingId: string): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/publish`,
    { method: "PUT" }
  )
}
export async function deleteTourScene(listingId: string, sceneId: string): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes/${sceneId}`,
    { method: "DELETE" }
  )
}

// DELETE /api/v1/listings/:listingId/tours
export async function deleteVirtualTour(listingId: string): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/tours`,
    { method: "DELETE" }
  )
}

export async function uploadListingImages(listingId: string, files: File[]): Promise<{ urls: string[] }> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetchFormData<ImageUploadResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/images/batch`,
    formData
  );

  return { 
    urls: response.map((img) => img.url) 
  };
}

export async function uploadListingVideos(listingId: string, files: File[]): Promise<{ videoIds: string[], urls: string[] }> {
  // Mock return
  return Promise.resolve({ 
    videoIds: ["mock-video-id-1", "mock-video-id-2"],
    urls: ["https://example.com/video1.mp4", "https://example.com/video2.mp4"]
  });
}

export async function publishListing(listingId: string): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/publish`,
    { method: "PUT" }
  )
}

export async function unpublishListing(listingId: string): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/unpublish`,
    { method: "PUT" }
  )
}

export async function getListingImages(listingId: string): Promise<ImageResponse[]> {
  return fetchJson<ImageResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/images`,
    { method: "GET" }
  )
}

export async function getListingVideos(listingId: string): Promise<VideoResponse[]> {
  return fetchJson<VideoResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/videos`,
    { method: "GET" }
  )
}

export async function getVirtualTour(listingId: string): Promise<VirtualTourResponse> {
  return fetchJson<VirtualTourResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours`,
    { method: "GET" }
  );
}


export async function getStaffListingDetails(listingId: string): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(`${API_BASE}/api/v1/staff/listings/${listingId}`)
  return mapApiListing(listing)
}

export async function approveListing(
  listingId: string, 
  staffNotesInternal: string,
  feedbackToSeller: string, 
  checklist: ChecklistItem[]
): Promise<void> {
  const checklistMap = checklist.reduce((acc, item) => {
    acc[item.label] = item.checked;
    return acc;
  }, {} as Record<string, boolean>);
  await fetchJson<void>(`${API_BASE}/api/v1/staff/listings/${listingId}/approve`, {
    method: "POST",
    body: JSON.stringify({ staffNotesInternal, feedbackToSeller, checklist: checklistMap }),
  })
}

export async function requestEditListing(
  listingId: string,
  feedback: string,
  staffNotes: string,
  issues: string[]
): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/staff/listings/${listingId}/request-edit`, {
    method: "POST",
    body: JSON.stringify({ feedback, staffNotes, issues }),
  })
}

export async function rejectListing(
  listingId: string,
  reason: string,
  feedback: string,
  staffNotes: string
): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/staff/listings/${listingId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason, feedback, staffNotes }),
  })
}

export async function getReviewHistory(listingId: string): Promise<ReviewHistoryItem[]> {
  return fetchJson<ReviewHistoryItem[]>(`${API_BASE}/api/v1/staff/listings/${listingId}/review-history`)
}

export async function saveStaffNotes(listingId: string, notes: string): Promise<void> {
  // await fetchJson<void>(`${API_BASE}/api/v1/staff/listings/${listingId}/notes`, {
  //   method: "PUT",
  //   body: JSON.stringify({ notes }),
  // })
}

export async function updateChecklist(listingId: string, checklist: ChecklistItem[]): Promise<void> {
  // await fetchJson<void>(`${API_BASE}/api/v1/staff/listings/${listingId}/checklist`, {
  //   method: "PUT",
  //   body: JSON.stringify({ checklist }),
  // })
}

export async function getPendingReviewListings(): Promise<Listing[]> {
  const data = await fetchJson<{ content?: ApiListingResponse[]; data?: ApiListingResponse[]; items?: ApiListingResponse[] }>(
    `${API_BASE}/api/v1/staff/listings/pending`
  )
  const items = data.content || data.data || data.items || []
  return items.map(mapApiListing)
}


