import type { Listing, Country, Province, Ward, ChecklistItem } from "@/lib/types";


const API_BASE =
  import.meta.env.VITE_API_BASE_LISTING || "http://localhost:8080";

const AUTH_API_BASE =
  import.meta.env.VITE_API_BASE_AUTH || "http://localhost:8080/api/v1";

const ESTATE_SEARCH_API_BASE =
  import.meta.env.VITE_API_BASE_ESTATE_SEARCH || API_BASE;

const CREDIT_API_BASE =
  import.meta.env.VITE_TRANSACTION_API_BASE_URL || "http://localhost:8086/api/v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

interface ApiListingResponse {
  listingId: string;
  userId?: string;
  title: string;
  description: string;
  listingType?: string;
  propertyType?: string;
  status?: string;
  isFreePost?: boolean;
  price?: number;
  priceCurrency?: string;
  pricePeriod?: string;
  negotiable?: boolean;
  areaSqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  floorNumber?: number;
  yearBuilt?: number;
  wardId?: string;
  provinceId?: string;
  countryId?: string;
  streetAddress?: string;
  buildingName?: string;
  latitude?: number;
  longitude?: number;
  featuredImageUrl?: string;
  viewCount?: number;
  saveCount?: number;
  contactCount?: number;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  publishedAt?: string;
  expiredAt?: string;
  amenities?: Array<{
    amenityId: string;
    amenityName: string;
    amenityCategory: string;
    iconUrl: string;
  }>;
  imageUrls?: string[];
}

type ViewAccuracy = "MONTH" | "DAY" | "HOUR" | "QUARTER_HOUR";

interface ViewBucketResponse {
  bucket: string;
  views: number;
}

export interface ViewStatsResponse {
  listingId: string;
  accuracy: ViewAccuracy;
  from?: string;
  to?: string;
  totalViews: number;
  data: ViewBucketResponse[];
}

export interface SellerDashboardSummaryResponse {
  totalListings: number;
  published: number;
  pendingReview: number;
  rejected: number;
  draft: number;
  totalViews7d: number;
}

export interface SellerDashboardSeriesPoint {
  bucket: string;
  views: number;
}

export interface SellerDashboardViewsSeriesResponse {
  from: string;
  to: string;
  accuracy: ViewAccuracy;
  data: SellerDashboardSeriesPoint[];
}

export interface SellerTopPerformerItem {
  listingId: string;
  title: string;
  views: number;
}

export interface SellerTopPerformersResponse {
  range: string;
  items: SellerTopPerformerItem[];
}

export interface SellerNeedsAttentionItem {
  listingId: string;
  title: string;
  status: "REJECTED" | "DRAFT" | string;
  reason?: string;
  updatedAt: string;
}

export interface SellerNeedsAttentionResponse {
  items: SellerNeedsAttentionItem[];
}

export interface SellerRecentListingItem {
  listingId: string;
  title: string;
  status: string;
  views: number;
  updatedAt: string;
}

export interface SellerRecentListingsResponse {
  items: SellerRecentListingItem[];
}

export interface CreateListingPayload {
  title: string;
  description: string;
  listingType: string;
  propertyType: string;
  price: number;
  priceCurrency?: string;
  pricePeriod?: string;
  negotiable?: boolean;
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  floorNumber?: number;
  yearBuilt?: number;
  wardId?: string;
  provinceId?: string;
  countryId?: string;
  streetAddress?: string;
  buildingName?: string;
  latitude?: number;
  longitude?: number;
}

export interface AmenityResponse {
  amenityId: string;
  amenityName: string;
  amenityCategory: string;
  iconUrl: string;
}

export interface PublicUserProfileResponse {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export type AdminCreditSettingKey =
  | "POST_COST_BASIC"
  | "POST_COST_PREMIUM_ADD"
  | "AI_CHAT_FREE_LIMIT"
  | "AI_CHAT_COST_PER_MSG";

export interface AdminCreditSetting {
  settingKey: AdminCreditSettingKey;
  value: number;
  description?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UpdateAdminCreditSettingPayload {
  value: number;
  description?: string;
}

export interface BulkAdminCreditSettingsPayload {
  postCostBasic: number;
  postCostPremiumAdd: number;
  aiChatFreeLimit: number;
  aiChatCostPerMsg: number;
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

export interface ListingReviewResponse {
  reviewId: string;
  listingId: string;
  reviewerId: string;
  reviewerRole: string;
  feedbackReportId?: string;
  previousStatus?: string;
  newStatus?: string;
  reviewAction: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  staffNotesInternal?: string;
  feedbackToSeller?: string;
  rejectionReason?: string;
  requiredChanges?: { field: string; issue: string; suggestion: string }[];
  checklistResults?: Record<string, boolean>;
  isResubmission?: boolean;
  previousReviewId?: string;
  reviewVersion?: number;
  reviewedAt?: string;
}
export interface ChatListingPublishedMessage {
  listingId: string;
  userId: string;
  title: string;
  description: string;
  listingType: string;
  propertyType: string;
  status: number;
  price: number;
  priceCurrency: string;
  pricePeriod: string | null;
  negotiable: boolean;
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  floors: number | null;
  floorNumber: number;
  yearBuilt: number;
  streetAddress: string;
  buildingName: string | null;
  wardName: string;
  provinceName: string;
  countryName: string;
  latitude: number | null;
  longitude: number | null;
  featuredImageUrl: string;
  imagesJson: Record<string, unknown>[];
  additionalInfoJson: Record<string, unknown> | null;
  viewCount: number;
  saveCount: number;
  contactCount: number;
  creditsLocked: number;
  creditsCharged: number;
  creditsRefunded: number;
  amenityNames: string[];
  hasVirtualTour: boolean;
  createdAt: number;
  updatedAt: number;
  submittedAt: number;
  publishedAt: number;
  expiredAt: number | null;
  freePost: boolean;
}

interface DiscoverSearchListingItem {
  id?: string;
  title?: string;
  description?: string;
  propertyType?: string;
  transactionType?: string;
  listingType?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  location?: {
    country?: string;
    province?: string;
    district?: string;
    ward?: string;
    streetAddress?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  propertyDetails?: {
    bedrooms?: number;
    bathrooms?: number;
    areaSqm?: number;
    yearBuilt?: number;
    floorNumber?: number;
    features?: string[];
  };
  pricing?: {
    price?: number;
  };
  media?: {
    images?: Array<{
      id?: string;
      url?: string;
      thumbnailUrl?: string;
      alt?: string;
      isCover?: boolean;
      order?: number;
    }>;
  };
}

export interface DiscoverListingsSearchParams {
  text?: string;
}

export interface ChatReplyDto {
  text: string;
  listings?: ChatListingPublishedMessage[];
}

export interface ChatSessionResponseDto {
  userId: string;
  sessionId: string;
  reply: ChatReplyDto;
}

export interface SendMessageDto {
  message: string;
}

export interface ChatClearSessionResponseDto {
  success: boolean;
  message: string;
}

export interface ChatHistoryContentPartDto {
  text?: string;
  functionCall?: Record<string, unknown>;
  functionResponse?: Record<string, unknown>;
}

export interface ChatHistoryContentDto {
  role: string;
  parts: ChatHistoryContentPartDto[];
  listings?: ChatListingPublishedMessage[];
}

export interface ChatHistoryResponseDto {
  userId: string;
  sessionId: string;
  history: ChatHistoryContentDto[];
}

export interface ChatSessionListItemDto {
  sessionId: string;
  updatedAt: string;
}

export interface ChatSessionsListResponseDto {
  userId: string;
  page: number;
  limit: number;
  total: number;
  sessions: ChatSessionListItemDto[];
}

export interface ReviewHistoryItem {
  reviewId: string;
  listingId: string;
  reviewerId: string;
  reviewerRole: string;
  feedbackReportId?: string;
  previousStatus?: string;
  newStatus?: string;
  reviewAction: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  staffNotesInternal?: string;
  feedbackToSeller?: string;
  rejectionReason?: string;
  requiredChanges?: { field: string; issue: string; suggestion: string }[];
  checklistResults?: Record<string, boolean>;
  isResubmission?: boolean;
  previousReviewId?: string;
  reviewVersion?: number;
  reviewedAt?: string;
}


export enum DocumentType {
  OWNERSHIP_CERTIFICATE = "OWNERSHIP_CERTIFICATE",
  LAND_USE_CERTIFICATE = "LAND_USE_CERTIFICATE",
  BUILDING_PERMIT = "BUILDING_PERMIT",
  CONSTRUCTION_PERMIT = "CONSTRUCTION_PERMIT",
  HOUSE_CERTIFICATE = "HOUSE_CERTIFICATE",
  TRANSFER_CONTRACT = "TRANSFER_CONTRACT",
  OTHER = "OTHER",
}

export interface DocumentResponse {
  documentId: string; // UUID
  listingId: string; // UUID
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number; // Long
  mimeType: string;
  documentNumber: string | null;
  issueDate: string | null; // OffsetDateTime (ISO String)
  issuingAuthority: string | null;
  expiryDate: string | null; // OffsetDateTime (ISO String)
  verified: boolean;
  verificationNotes: string | null;
  uploadedAt: string; // OffsetDateTime (ISO String)
  updatedAt: string; // OffsetDateTime (ISO String)
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
  sceneName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  hotspotsJson: any[];
}

export interface TourResponse {
  tourId: string;
  tourUrl: string;
  tourProvider: string;
}

export interface TourSceneResponse {
  sceneId: string;
  sceneName: string;
  panoramaUrl: string;
  sceneOrder: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  hotspotsJson: any[];
}

export interface ImageResponse {
  imageId: string;
  url: string;
  isCover: boolean;
  displayOrder: number;
}

export interface VideoResponse {
  videoId: string;
  url: string;
  displayOrder: number;
}
export interface VirtualTourResponse {
  tourId: string; // UUID -> string
  listingId: string; // UUID -> string
  tourUrl: string;
  tourProvider: string;
  totalScenes: number; // Integer -> number
  isPublished: boolean;
  createdAt: string; // OffsetDateTime -> string (ISO Date)
  updatedAt: string; // OffsetDateTime -> string (ISO Date)
  scenes: TourSceneResponse[];
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchFormData<T>(
  url: string,
  body: FormData,
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function replaceMinioUrl(url: string): string {
  const BASE = import.meta.env.VIBE_API_BASE_MINIO;
  if (!BASE) return url;

  return BASE + url.split("/").slice(3).join("/");
}

function mapApiListing(listing: ApiListingResponse): Listing {
  const imageUrls = listing.imageUrls || (listing.featuredImageUrl ? [listing.featuredImageUrl] : []);

  return {
    id: listing.listingId,
    title: listing.title,
    description: listing.description,
    propertyType:
      (listing.propertyType as Listing["propertyType"]) || "APARTMENT",
    transactionType:
      (listing.listingType as Listing["transactionType"]) || "SALE",

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
    images: imageUrls.map((url, index) => {
      const idMatch = url.match(/\/images\/([^.?]+)/);
      const id = idMatch ? idMatch[1] : `img-${index}`;

      return {
        id: id,
        url: replaceMinioUrl(url),
        thumbnailUrl: replaceMinioUrl(url),
        alt: `${listing.title} - ${index + 1}`,
        isCover:
          url === listing.featuredImageUrl ||
          (index === 0 && !listing.featuredImageUrl),
        order: index,
      };
    }),
    videos: [],
    amenities:
      listing.amenities?.map((a) => ({
        amenityId: a.amenityId,
        amenityName: a.amenityName,
        amenityCategory: a.amenityCategory,
        iconUrl: a.iconUrl,
      })) || [],
    listingType: "",
    mediaType: "photos_only",
    areaSqm: listing.areaSqm ?? 0,
    features: [],
    status: (listing.status as Listing["status"]) || "DRAFT",

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
    featuredImageUrl: listing.featuredImageUrl || "",
    submittedAt: listing.submittedAt,
  };
}

function parseImageUrlFromUnknown(value: unknown): string {
  if (!isRecord(value)) return "";
  const raw = value.url ?? value.imageUrl;
  return typeof raw === "string" ? raw : "";
}

function toIsoDate(value: number | string | undefined): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return undefined;
}

function extractTextField(document: string | undefined, field: string): string {
  if (!document) return "";
  const regex = new RegExp(`${field}\\s*:\\s*([^\\n]+)`, "i");
  const match = document.match(regex);
  return match?.[1]?.trim() || "";
}

function parseImageUrlsFromMetadata(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((value): value is string => typeof value === "string");
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((value): value is string => typeof value === "string");
      }
    } catch {
      const urlMatches = raw.match(/https?:\/\/[^\s"'\\]+/g);
      return urlMatches || [];
    }
  }

  return [];
}

function parseListingIdFromResultId(resultId: unknown): string {
  if (typeof resultId !== "string") return "";
  const imageIdMatch = resultId.match(/^(.+)-img-\d+$/);
  return imageIdMatch ? imageIdMatch[1] : resultId;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function mapVectorSearchResponseToListings(response: unknown): Listing[] {
  if (!isRecord(response) || !isRecord(response.results)) return [];

  const results = response.results;
  const metadataGroups = Array.isArray(results.metadatas) ? results.metadatas : [];
  const documentGroups = Array.isArray(results.documents) ? results.documents : [];
  const idGroups = Array.isArray(results.ids) ? results.ids : [];

  const metadataItems = Array.isArray(metadataGroups[0]) ? metadataGroups[0] : [];
  const documentItems = Array.isArray(documentGroups[0]) ? documentGroups[0] : [];
  const idItems = Array.isArray(idGroups[0]) ? idGroups[0] : [];
  const maxLen = Math.max(metadataItems.length, documentItems.length, idItems.length);

  const byListingId = new Map<string, Listing>();

  for (let index = 0; index < maxLen; index += 1) {
    const metadata = isRecord(metadataItems[index]) ? metadataItems[index] : {};
    const document = typeof documentItems[index] === "string" ? documentItems[index] : "";
    const resultId = idItems[index];

    const listingIdFromMeta = typeof metadata.listingId === "string" ? metadata.listingId : "";
    const listingId = listingIdFromMeta || parseListingIdFromResultId(resultId);
    if (!listingId || byListingId.has(listingId)) continue;

    const title =
      (typeof metadata.propertyName === "string" ? metadata.propertyName : "") ||
      extractTextField(document, "Title") ||
      `Listing ${listingId}`;

    const description = extractTextField(document, "Description");
    const typeField = extractTextField(document, "Type").toUpperCase();
    const listingType = typeField.includes("RENT") ? "RENT" : "SALE";
    let propertyType = "APARTMENT";
    if (typeField.includes("COMMERCIAL")) propertyType = "COMMERCIAL";
    else if (typeField.includes("VILLA")) propertyType = "VILLA";
    else if (typeField.includes("HOUSE")) propertyType = "HOUSE";
    else if (typeField.includes("LAND")) propertyType = "LAND";

    const price = toNumberValue(metadata.price, toNumberValue(extractTextField(document, "Price"), 0));
    const address = extractTextField(document, "Address");

    const bedBathLine = document.match(/Bedrooms\s*:\s*(\d+)\s*,\s*Bathrooms\s*:\s*(\d+)/i);
    const bedrooms = bedBathLine ? Number(bedBathLine[1]) : 0;
    const bathrooms = bedBathLine ? Number(bedBathLine[2]) : 0;

    const amenitiesText = extractTextField(document, "Amenities");
    const amenityNames = amenitiesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const imageUrls = parseImageUrlsFromMetadata(metadata.images);

    const promptListing: ChatListingPublishedMessage = {
      listingId,
      userId: "",
      title,
      description,
      listingType,
      propertyType,
      status: 0,
      price,
      priceCurrency: "VND",
      pricePeriod: null,
      negotiable: false,
      areaSqm: 0,
      bedrooms,
      bathrooms,
      floors: null,
      floorNumber: 0,
      yearBuilt: 0,
      streetAddress: address,
      buildingName: null,
      wardName: "",
      provinceName: "",
      countryName: "",
      latitude: null,
      longitude: null,
      featuredImageUrl: imageUrls[0] || "",
      imagesJson: imageUrls.map((url) => ({ url })),
      additionalInfoJson: null,
      viewCount: 0,
      saveCount: 0,
      contactCount: 0,
      creditsLocked: 0,
      creditsCharged: 0,
      creditsRefunded: 0,
      amenityNames,
      hasVirtualTour: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAt: Date.now(),
      publishedAt: Date.now(),
      expiredAt: null,
      freePost: false,
    };

    byListingId.set(listingId, mapPromptListingToListing(promptListing));
  }

  return Array.from(byListingId.values());
}

function mapPromptListingToListing(listing: ChatListingPublishedMessage): Listing {
  const imageUrls = Array.isArray(listing.imagesJson)
    ? listing.imagesJson
        .map((item) => parseImageUrlFromUnknown(item))
        .filter((url): url is string => Boolean(url))
    : [];

  const apiListing: ApiListingResponse = {
    listingId: listing.listingId,
    userId: listing.userId,
    title: listing.title,
    description: listing.description,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    status: "PUBLISHED",
    price: listing.price,
    priceCurrency: listing.priceCurrency,
    pricePeriod: listing.pricePeriod ?? undefined,
    negotiable: listing.negotiable,
    areaSqm: listing.areaSqm,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    floors: listing.floors ?? undefined,
    floorNumber: listing.floorNumber,
    yearBuilt: listing.yearBuilt,
    streetAddress: listing.streetAddress,
    buildingName: listing.buildingName ?? undefined,
    wardId: listing.wardName,
    provinceId: listing.provinceName,
    countryId: listing.countryName,
    latitude: listing.latitude ?? undefined,
    longitude: listing.longitude ?? undefined,
    featuredImageUrl: listing.featuredImageUrl,
    imageUrls,
    viewCount: listing.viewCount,
    saveCount: listing.saveCount,
    contactCount: listing.contactCount,
    createdAt: toIsoDate(listing.createdAt),
    updatedAt: toIsoDate(listing.updatedAt),
    submittedAt: toIsoDate(listing.submittedAt),
    publishedAt: toIsoDate(listing.publishedAt),
    expiredAt: toIsoDate(listing.expiredAt ?? undefined),
    amenities: listing.amenityNames.map((name, index) => ({
      amenityId: `amenity-${index}`,
      amenityName: name,
      amenityCategory: "OTHER",
      iconUrl: "",
    })),
  };

  return mapApiListing(apiListing);
}

function mapDiscoverSearchItemToListing(item: DiscoverSearchListingItem): Listing | null {
  if (!item.id || !item.title) return null;

  const apiListing: ApiListingResponse = {
    listingId: item.id,
    title: item.title,
    description: item.description || "",
    propertyType: item.propertyType,
    listingType: item.transactionType || item.listingType,
    status: item.status || "PUBLISHED",
    price: item.pricing?.price,
    areaSqm: item.propertyDetails?.areaSqm,
    bedrooms: item.propertyDetails?.bedrooms,
    bathrooms: item.propertyDetails?.bathrooms,
    floorNumber: item.propertyDetails?.floorNumber,
    yearBuilt: item.propertyDetails?.yearBuilt,
    streetAddress: item.location?.streetAddress,
    wardId: item.location?.ward,
    provinceId: item.location?.province,
    countryId: item.location?.country,
    latitude: item.location?.coordinates?.lat,
    longitude: item.location?.coordinates?.lng,
    featuredImageUrl: item.media?.images?.find((img) => img.isCover)?.url || item.media?.images?.[0]?.url,
    imageUrls: item.media?.images?.map((img) => img.url || "").filter((url): url is string => Boolean(url)),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  return mapApiListing(apiListing);
}


export async function listSellerListings(): Promise<Listing[]> {
  const data = await fetchJson<{
    content?: ApiListingResponse[];
    data?: ApiListingResponse[];
    items?: ApiListingResponse[];
  }>(`${API_BASE}/api/v1/seller/listings`);
  const items = data.content || data.data || data.items || [];
  return items.map(mapApiListing);
}

export async function getListingDetails(id: string): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(
    `${API_BASE}/api/v1/seller/listings/${id}`,
  );
  return mapApiListing(listing);
}

export async function listPublishedListings(
  page = 0,
  size = 30,
): Promise<Listing[]> {
  const data = await fetchJson<{
    content?: ApiListingResponse[];
    data?: ApiListingResponse[];
    items?: ApiListingResponse[];
  }>(`${API_BASE}/api/v1/listings?page=${page}&size=${size}`);

  const items = data.content || data.data || data.items || [];
  return items.map(mapApiListing);
}

export async function getPublishedListingDetails(id: string): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(
    `${API_BASE}/api/v1/listings/${id}`,
  );
  return mapApiListing(listing);
}

export async function getPublicUserProfile(userId: string): Promise<PublicUserProfileResponse> {
  return fetchJson<PublicUserProfileResponse>(
    `${AUTH_API_BASE}/users/${userId}/profile`,
  );
}

export async function getAdminCreditSettings(): Promise<AdminCreditSetting[]> {
  return fetchJson<AdminCreditSetting[]>(`${CREDIT_API_BASE}/admin/credit-settings`);
}

export async function getAdminCreditSetting(
  key: AdminCreditSettingKey,
): Promise<AdminCreditSetting> {
  return fetchJson<AdminCreditSetting>(`${CREDIT_API_BASE}/admin/credit-settings/${key}`);
}

export async function updateAdminCreditSetting(
  key: AdminCreditSettingKey,
  payload: UpdateAdminCreditSettingPayload,
): Promise<AdminCreditSetting> {
  return fetchJson<AdminCreditSetting>(`${CREDIT_API_BASE}/admin/credit-settings/${key}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function bulkUpdateAdminCreditSettings(
  payload: BulkAdminCreditSettingsPayload,
): Promise<AdminCreditSetting[]> {
  return fetchJson<AdminCreditSetting[]>(`${CREDIT_API_BASE}/admin/credit-settings/bulk`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function resetDailyAiChatCountForUser(userId: string): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${CREDIT_API_BASE}/admin/credit-settings/ai-chat/reset-daily/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }
}

export async function recordListingView(listingId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/analytics/listings/view`, {
    method: "POST",
    body: JSON.stringify({ listingId }),
  });
}

export async function getListingViewStats(
  listingId: string,
  params?: {
    from?: string;
    to?: string;
    accuracy?: ViewAccuracy;
  },
): Promise<ViewStatsResponse> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.accuracy) query.set("accuracy", params.accuracy);

  const suffix = query.toString();
  return fetchJson<ViewStatsResponse>(
    `${API_BASE}/analytics/listings/${listingId}/views${suffix ? `?${suffix}` : ""}`,
  );
}

export async function getSellerDashboardSummary(): Promise<SellerDashboardSummaryResponse> {
  return fetchJson<SellerDashboardSummaryResponse>(
    `${API_BASE}/api/v1/seller/dashboard/summary`,
  );
}

export async function getSellerDashboardViewsSeries(params?: {
  from?: string;
  to?: string;
  accuracy?: ViewAccuracy;
}): Promise<SellerDashboardViewsSeriesResponse> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.accuracy) query.set("accuracy", params.accuracy);

  const suffix = query.toString();
  return fetchJson<SellerDashboardViewsSeriesResponse>(
    `${API_BASE}/api/v1/seller/dashboard/views-series${suffix ? `?${suffix}` : ""}`,
  );
}

export async function getSellerTopPerformers(range = "7d", limit = 5): Promise<SellerTopPerformersResponse> {
  const query = new URLSearchParams({ range, limit: String(limit) });
  return fetchJson<SellerTopPerformersResponse>(
    `${API_BASE}/api/v1/seller/dashboard/top-performers?${query.toString()}`,
  );
}

export async function getSellerNeedsAttention(limit = 10): Promise<SellerNeedsAttentionResponse> {
  const query = new URLSearchParams({ limit: String(limit) });
  return fetchJson<SellerNeedsAttentionResponse>(
    `${API_BASE}/api/v1/seller/listings/needs-attention?${query.toString()}`,
  );
}

export async function getSellerRecentListings(limit = 10): Promise<SellerRecentListingsResponse> {
  const query = new URLSearchParams({ limit: String(limit) });
  return fetchJson<SellerRecentListingsResponse>(
    `${API_BASE}/api/v1/seller/listings/recent?${query.toString()}`,
  );
}

export async function createListingDraft(
  payload: CreateListingPayload,
): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(
    `${API_BASE}/api/v1/seller/listings/draft`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return mapApiListing(listing);
}

export async function updateListing(
  id: string,
  payload: Partial<CreateListingPayload>,
): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(
    `${API_BASE}/api/v1/seller/listings/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
  return mapApiListing(listing);
}

export async function deleteListingDraft(id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${id}`, {
    method: "DELETE",
  });
}

export async function submitListingForReview(id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${id}/submit`, {
    method: "PUT",
  });
}

export async function getCountries(): Promise<Country[]> {
  return fetchJson<Country[]>(`${API_BASE}/api/v1/locations/countries`);
}

export async function getProvinces(countryId: string): Promise<Province[]> {
  return fetchJson<Province[]>(
    `${API_BASE}/api/v1/locations/provinces?countryId=${countryId}`,
  );
}

export async function getWards(provinceId: string): Promise<Ward[]> {
  return fetchJson<Ward[]>(
    `${API_BASE}/api/v1/locations/wards?provinceId=${provinceId}`,
  );
}

export interface LocationLookupItem {
  type: "WARD" | "STREET" | "POI" | string;
  id: string;
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
  score?: number;
}

export interface LocationSearchResponse {
  query: string;
  total: number;
  items: LocationLookupItem[];
}

export interface ReverseGeocodeResponse {
  normalizedAddress: string;
  streetAddress?: string;
  coordinate?: {
    lat: number;
    lng: number;
  };
  ward?: {
    wardId: string;
    name: string;
  };
  province?: {
    provinceId: string;
    name: string;
  };
  country?: {
    countryId: string;
    name: string;
  };
}

export async function searchLocationSuggestions(params: {
  q: string;
  countryId?: string;
  provinceId?: string;
  wardId?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}): Promise<LocationSearchResponse> {
  const query = new URLSearchParams();
  query.set("q", params.q);
  query.set("limit", String(params.limit ?? 8));
  if (params.countryId) query.set("countryId", params.countryId);
  if (params.provinceId) query.set("provinceId", params.provinceId);
  if (params.wardId) query.set("wardId", params.wardId);
  if (typeof params.lat === "number") query.set("lat", String(params.lat));
  if (typeof params.lng === "number") query.set("lng", String(params.lng));

  return fetchJson<LocationSearchResponse>(
    `${API_BASE}/api/v1/locations/search?${query.toString()}`,
  );
}

export async function reverseGeocodeLocation(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResponse> {
  const query = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });

  return fetchJson<ReverseGeocodeResponse>(
    `${API_BASE}/api/v1/locations/reverse?${query.toString()}`,
  );
}

export async function getCoordinates(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
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

export async function searchListingsByPrompt(
  payload: Record<string, unknown>,
): Promise<ChatListingPublishedMessage[]> {
  const response = await fetchJson<unknown>(
    `${ESTATE_SEARCH_API_BASE}/listings/search`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  if (Array.isArray(response)) {
    return response as ChatListingPublishedMessage[];
  }

  if (isRecord(response)) {
    const candidates = [
      response.listings,
      response.data,
      response.items,
      response.content,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ChatListingPublishedMessage[];
      }
    }
  }

  return [];
}

export async function searchDiscoverListings(
  params: DiscoverListingsSearchParams,
): Promise<Listing[]> {
  const payload: Record<string, unknown> = {
    text: params.text || "",
  };

  const response = await fetchJson<unknown>(
    `${ESTATE_SEARCH_API_BASE}/listings/search`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  const vectorResults = mapVectorSearchResponseToListings(response);
  if (vectorResults.length > 0) return vectorResults;

  const candidates = Array.isArray(response)
    ? response
    : isRecord(response)
      ? [response.listings, response.data, response.items, response.content].find(Array.isArray) || []
      : [];

  if (!Array.isArray(candidates)) return [];

  const promptStyleResults = candidates
    .filter((item): item is ChatListingPublishedMessage => isRecord(item) && typeof item.listingId === "string")
    .map(mapPromptListingToListing);
  if (promptStyleResults.length > 0) return promptStyleResults;

  return candidates
    .map((item) => mapDiscoverSearchItemToListing(item as DiscoverSearchListingItem))
    .filter((item): item is Listing => Boolean(item));
}

export async function createChatSession(): Promise<ChatSessionResponseDto> {
  return fetchJson<ChatSessionResponseDto>(`${ESTATE_SEARCH_API_BASE}/chat`, {
    method: "POST",
  });
}

export async function getChatSessions(
  page = 1,
  limit = 20,
): Promise<ChatSessionsListResponseDto> {
  return fetchJson<ChatSessionsListResponseDto>(
    `${ESTATE_SEARCH_API_BASE}/chat?page=${page}&limit=${limit}`,
  );
}

export async function sendChatMessage(
  sessionId: string,
  payload: SendMessageDto,
): Promise<ChatSessionResponseDto> {
  return fetchJson<ChatSessionResponseDto>(
    `${ESTATE_SEARCH_API_BASE}/chat/${sessionId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function clearChatSession(
  sessionId: string,
): Promise<ChatClearSessionResponseDto> {
  return fetchJson<ChatClearSessionResponseDto>(
    `${ESTATE_SEARCH_API_BASE}/chat/${sessionId}`,
    {
      method: "DELETE",
    },
  );
}

export async function getChatHistory(
  sessionId: string,
): Promise<ChatHistoryResponseDto> {
  return fetchJson<ChatHistoryResponseDto>(
    `${ESTATE_SEARCH_API_BASE}/chat/${sessionId}/history`,
  );
}

export async function getListingPOIs(
  listingId: string,
): Promise<POIResponse[]> {
  return fetchJson<POIResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/pois`,
  );
}

export async function updateListingAmenities(
  id: string,
  amenityIds: string[],
): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${id}/amenities`, {
    method: "PUT",
    body: JSON.stringify(amenityIds),
  });
}

export async function uploadListingDocuments(
  listingId: string,
  files: File[],
  requests: UploadDocumentRequest[],
): Promise<DocumentResponse[]> {
  const formData = new FormData();

  files.forEach((file) => formData.append("files", file));

  const dataBlob = new Blob([JSON.stringify(requests)], {
    type: "application/json",
  });
  formData.append("data", dataBlob);

  return fetchFormData<DocumentResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/documents/batch`,
    formData,
  );
}

// Assuming API_BASE and fetchJson are defined elsewhere,
// otherwise replace with simple Promise.resolve()

export async function createVirtualTour(
  listingId: string,
): Promise<{ tourId: string }> {
  const body = {
    tourUrl: "",
    tourProvider: "Internal",
  };

  const response = await fetchJson<TourResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return { tourId: response.tourId };
}
export async function addTourScene(
  listingId: string,
  file: File,
  data: TourSceneRequest,
): Promise<{ sceneId: string }> {
  const formData = new FormData();

  const dataBlob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  formData.append("data", dataBlob);

  formData.append("file", file, file.name);

  const response = await fetchFormData<TourSceneResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes`,
    formData,
  );

  return { sceneId: response.sceneId };
}
export async function updateTourScene(
  listingId: string,
  sceneId: string,
  data: TourSceneRequest,
): Promise<TourSceneResponse> {
  return fetchJson<TourSceneResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes/${sceneId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function reorderTourScenes(
  listingId: string,
  sceneIds: string[],
): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes/reorder`,
    {
      method: "PUT",
      body: JSON.stringify(sceneIds),
    },
  );
}

export async function publishTour(listingId: string): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/publish`,
    { method: "PUT" },
  );
}
export async function deleteTourScene(
  listingId: string,
  sceneId: string,
): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/listings/${listingId}/tours/scenes/${sceneId}`,
    { method: "DELETE" },
  );
}

// DELETE /api/v1/listings/:listingId/tours
export async function deleteVirtualTour(listingId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/listings/${listingId}/tours`, {
    method: "DELETE",
  });
}

export async function uploadListingImages(
  listingId: string,
  files: File[],
): Promise<{ urls: string[] }> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetchFormData<ImageUploadResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/images/batch`,
    formData,
  );

  return {
    urls: response.map((img) => img.url),
  };
}

export async function uploadListingVideos(
  listingId: string,
  files: File[],
): Promise<{ videoIds: string[]; urls: string[] }> {
  // Mock return
  return Promise.resolve({
    videoIds: ["mock-video-id-1", "mock-video-id-2"],
    urls: ["https://example.com/video1.mp4", "https://example.com/video2.mp4"],
  });
}

export async function publishListing(listingId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${listingId}/publish`, {
    method: "PUT",
  });
}

export async function unpublishListing(listingId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/v1/seller/listings/${listingId}/unpublish`, {
    method: "PUT",
  });
}

export async function getListingImages(
  listingId: string,
): Promise<ImageResponse[]> {
  return fetchJson<ImageResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/images`,
    { method: "GET" },
  );
}

export async function getListingVideos(
  listingId: string,
): Promise<VideoResponse[]> {
  return fetchJson<VideoResponse[]>(
    `${API_BASE}/api/v1/listings/${listingId}/videos`,
    { method: "GET" },
  );
}

export async function getVirtualTour(
  listingId: string,
): Promise<VirtualTourResponse> {
  return fetchJson<VirtualTourResponse>(
    `${API_BASE}/api/v1/listings/${listingId}/tours`,
    { method: "GET" },
  );
}

export async function getStaffListingDetails(
  listingId: string,
): Promise<Listing> {
  const listing = await fetchJson<ApiListingResponse>(
    `${API_BASE}/api/v1/staff/listings/${listingId}`,
  );
  return mapApiListing(listing);
}

export async function approveListing(
  listingId: string,
  staffNotesInternal: string,
  feedbackToSeller: string,
  checklist: ChecklistItem[],
): Promise<void> {
  const checklistMap = checklist.reduce(
    (acc, item) => {
      acc[item.label] = item.checked;
      return acc;
    },
    {} as Record<string, boolean>,
  );
  await fetchJson<void>(
    `${API_BASE}/api/v1/staff/listings/${listingId}/approve`,
    {
      method: "PUT",
      body: JSON.stringify({
        staffNotesInternal,
        feedbackToSeller,
        checklist: checklistMap,
      }),
    },
  );
}

export async function rejectListing(
  listingId: string,
  reason: string,
  feedback: string,
  staffNotes: string,
): Promise<void> {
  await fetchJson<void>(
    `${API_BASE}/api/v1/staff/listings/${listingId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({
        rejectionReason: reason,
        feedbackToSeller: feedback,
        staffNotesInternal: staffNotes,
      }),
    },
  );
}

export async function getReviewHistory(
  listingId: string,
): Promise<ListingReviewResponse[]> {
  return fetchJson<ListingReviewResponse[]>(
    `${API_BASE}/api/v1/staff/listings/${listingId}/review-history`,
  );
}


export async function getPendingReviews(): Promise<Listing[]> {
  const data = await fetchJson<{
    content?: ApiListingResponse[];
    data?: ApiListingResponse[];
    items?: ApiListingResponse[];
  }>(`${API_BASE}/api/v1/staff/listings/pending-reviews`);
  const items = data.content || data.data || data.items || Array.isArray(data) ? data as any as ApiListingResponse[] : [];
  return items.map(mapApiListing);
}

export async function getMyReviews(): Promise<Listing[]> {
  const data = await fetchJson<{
    content?: ApiListingResponse[];
    data?: ApiListingResponse[];
    items?: ApiListingResponse[];
  }>(`${API_BASE}/api/v1/staff/listings/my-reviews`);
  const items = data.content || data.data || data.items || Array.isArray(data) ? data as any as ApiListingResponse[] : [];
  return items.map(mapApiListing);
}

export async function getPendingReviewListings(page = 0, size = 50): Promise<Listing[]> {
  const data = await fetchJson<{
    content?: ApiListingResponse[];
    data?: ApiListingResponse[];
    items?: ApiListingResponse[];
  }>(`${API_BASE}/api/v1/staff/listings/pending?page=${page}&size=${size}`);
  const items = data.content || data.data || data.items || [];
  return items.map(mapApiListing);
}

