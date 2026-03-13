import axios, { AxiosInstance } from "axios";
import { SearchResponse, SearchListingsParams, SearchListing } from "./types";
import { mockSearchListings } from "./mock-data";

// Create a dedicated axios instance for search so we can easily swap out the base URL
const searchApiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_LISTING || "http://localhost:8080",
});

// Mock interceptor to intercept the /api/v1/listings route and simulate a backend request
searchApiClient.interceptors.request.use(async (config) => {
  // Only mock the specific search endpoint
  if (config.url?.includes("/api/v1/listings") && config.method === "get") {
    // 1. Simulate Network Latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 2. Parse Query Params
    const params = config.params as SearchListingsParams || {};

    const {
      query,
      propertyType,
      transactionType,
      minPrice,
      maxPrice,
      minBedrooms,
      minBathrooms,
      minArea,
      sort,
      page = 1,
      pageSize = 20,
    } = params;

    // 3. Filter the Mock Data
    let filtered: SearchListing[] = mockSearchListings.filter((listing) => {
      // Free-text query (searches title and description and location)
      if (query) {
        const q = query.toLowerCase();
        const fullAddr = `${listing.location.streetAddress} ${listing.location.district} ${listing.location.province}`.toLowerCase();
        const matchesQuery =
          listing.title.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q) ||
          fullAddr.includes(q);
        if (!matchesQuery) return false;
      }

      // Property Type
      if (propertyType && propertyType !== "all" && listing.propertyType !== propertyType) {
        return false;
      }

      // Transaction Type
      if (transactionType && listing.transactionType !== transactionType) {
        return false;
      }

      // Pricing
      if (minPrice !== undefined && listing.pricing.price < minPrice) return false;
      if (maxPrice !== undefined && listing.pricing.price > maxPrice) return false;

      // Property Details
      if (minBedrooms !== undefined && (listing.propertyDetails.bedrooms || 0) < minBedrooms) return false;
      if (minBathrooms !== undefined && (listing.propertyDetails.bathrooms || 0) < minBathrooms) return false;
      if (minArea !== undefined && (listing.propertyDetails.areaSqm || 0) < minArea) return false;


      return true;
    });

    // 4. Sort the Filtered Data
    if (sort) {
      filtered = [...filtered].sort((a, b) => {
        if (sort === "price_asc") return a.pricing.price - b.pricing.price;
        if (sort === "price_desc") return b.pricing.price - a.pricing.price;
        if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Default `relevance` does nothing as it's mocked, but normally backend orders by text match score.
        return 0;
      });
    }

    // 5. Paginate
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    // 6. Build final response
    const mockResponse: SearchResponse = {
      data: paginated,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    // Return an adapter override to serve the mocked response
    config.adapter = () => {
      return Promise.resolve({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
        request: {},
      });
    };
  }

  return config;
});

/**
 * Searches and filters listings.
 * Currently uses an Axios interceptor to simulate latency and behavior locally,
 * making it a drop-in replacement when the real server endpoint becomes available.
 */
export async function getSearchListings(params?: SearchListingsParams): Promise<SearchResponse> {
  const response = await searchApiClient.get<SearchResponse>("/api/v1/listings", {
    params,
  });
  return response.data;
}
