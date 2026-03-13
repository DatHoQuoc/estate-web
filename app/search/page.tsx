"use client"

import { useEffect, useState, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { DiscoveryFilters } from "@/components/buyer/discovery-filters"
import { SearchMapResults } from "./components/search-map-results"
import { NaturalLanguageSearch } from "@/components/buyer/nl-search"
import { Button } from "@/components/ui/button"
import { getSearchListings } from "@/lib/api/search/client"
import { SearchListing, SearchListingsParams, PropertyTypeEnum, TransactionTypeEnum } from "@/lib/api/search/types"

export default function SearchPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const initialQuery = params.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [propertyType, setPropertyType] = useState<PropertyTypeEnum | "all">("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [bedrooms, setBedrooms] = useState("any")
  const [sort, setSort] = useState<SearchListingsParams["sort"]>("relevance")
  
  const [listings, setListings] = useState<SearchListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      try {
        const searchParams: SearchListingsParams = {
          query: query || undefined,
          propertyType: propertyType === "all" ? undefined : propertyType as PropertyTypeEnum,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          minBedrooms: bedrooms === "any" ? undefined : Number(bedrooms),
          sort: sort === "relevance" ? undefined : sort,
          page: 1,
          pageSize: 50, // Enough for the map view mock
        }
        
        const response = await getSearchListings(searchParams)
        setListings(response.data)
        
        if (response.data.length > 0 && !selectedId) {
           setSelectedId(response.data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce effect
    const timeoutId = setTimeout(() => {
        fetchListings()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, propertyType, minPrice, maxPrice, bedrooms, sort])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-6 max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Search Properties</h1>
            <p className="text-muted-foreground mt-1 text-sm">Find your next home using our powerful real-time filters.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/discover/assistant")}>Open AI assistant</Button>
        </div>

        <NaturalLanguageSearch
          defaultQuery={initialQuery}
          onSearch={(value) => {
            setQuery(value)
            setParams((prev) => {
                if (value) prev.set("q", value)
                else prev.delete("q")
                return prev
            })
          }}
        />

        <DiscoveryFilters
          propertyType={propertyType}
          onPropertyTypeChange={(val) => setPropertyType(val as any)}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          bedrooms={bedrooms}
          onBedroomsChange={setBedrooms}
          sort={sort || "relevance"}
          onSortChange={(val) => setSort(val as any)}
        />

        <SearchMapResults
          listings={listings}
          loading={loading}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id)
            // Optional: navigate to details immediately or just select on map
            // navigate(`/discover/listings/${id}`)
          }}
          onConnect={(id) => navigate(`/discover/connect?listingId=${id}`)}
          onAskAI={(id) => navigate(`/discover/assistant?listingId=${id}`)}
        />
      </main>
    </div>
  )
}
