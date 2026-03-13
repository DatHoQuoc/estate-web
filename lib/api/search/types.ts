export type PropertyTypeEnum = "apartment" | "house" | "villa" | "office" | "commercial";
export type TransactionTypeEnum = "sale" | "rent";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationDetails {
  country: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

export interface PropertyDetails {
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  yearBuilt?: number;
  floorNumber?: number;
  totalFloors?: number;
  direction?: string;
  features?: string[];
}

export interface PricingDetails {
  price: number;
  currency: string;
  formattedPrice?: string;
  pricePerSqm?: number;
}

export interface LegalDetails {
  legalStatus?: string;
  ownershipType?: string;
}

export interface Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt?: string;
  isCover: boolean;
  order: number;
}

export interface Video {
  id: string;
  url: string;
  thumbnailUrl: string;
}

export interface MediaDetails {
  images: Image[];
  videos?: Video[];
}

export interface AgentDetails {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
}

export interface SearchListing {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyTypeEnum;
  transactionType: TransactionTypeEnum;
  location: LocationDetails;
  propertyDetails: PropertyDetails;
  pricing: PricingDetails;
  legal?: LegalDetails;
  media: MediaDetails;
  agent: AgentDetails;
  status: "published" | "draft" | "pending" | "sold";
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchResponse {
  data: SearchListing[];
  meta: PaginationMeta;
}

export interface SearchListingsParams {
  query?: string;
  propertyType?: PropertyTypeEnum | "all";
  transactionType?: TransactionTypeEnum;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  page?: number;
  pageSize?: number;
}
