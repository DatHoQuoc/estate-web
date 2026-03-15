"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { DiscoveryFilters } from "@/components/buyer/discovery-filters"
import { MapResults } from "@/components/buyer/map-results"
import { NaturalLanguageSearch } from "@/components/buyer/nl-search"
import { Button } from "@/components/ui/button"
import { listPublishedListings, searchDiscoverListings } from "@/lib/api-client"
import type { Listing } from "@/lib/types"

export default function MapDiscoveryPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryFromUrl = params.get("q") || ""

  const [query, setQuery] = useState(queryFromUrl)
  const [propertyType, setPropertyType] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [bedrooms, setBedrooms] = useState("any")
  const [sort, setSort] = useState("relevance")
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const reloadTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setQuery(queryFromUrl)
  }, [queryFromUrl])

  useEffect(() => {
    return () => {
      if (reloadTimerRef.current !== null) {
        window.clearTimeout(reloadTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const request = queryFromUrl.trim()
      ? searchDiscoverListings({
          text: queryFromUrl,
        })
      : listPublishedListings(0, 200)

    request
      .then((data) => {
        if (!mounted) return
        setListings(data)
        setSelectedId(data[0]?.id)
        setError(null)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err instanceof Error ? err.message : "Failed to load listings")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [queryFromUrl, refreshToken])

  const filteredListings = useMemo(() => {
    const min = Number(minPrice) || 0
    const max = Number(maxPrice) || Number.MAX_SAFE_INTEGER
    const beds = bedrooms === "any" ? 0 : Number(bedrooms)

    const base = listings.filter((listing) => {
      const matchesType =
        propertyType === "all"
          ? true
          : String(listing.propertyType || "").toLowerCase() === propertyType.toLowerCase()
      const matchesPrice = (listing.price || 0) >= min && (listing.price || 0) <= max
      const matchesBeds = (listing.bedrooms || 0) >= beds
      return matchesType && matchesPrice && matchesBeds
    })

    if (sort === "price_low") return [...base].sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === "price_high") return [...base].sort((a, b) => (b.price || 0) - (a.price || 0))
    if (sort === "new") return base
    return base
  }, [listings, propertyType, minPrice, maxPrice, bedrooms, sort])

  const handleSearch = (value: string) => {
    const normalized = value.trim()
    setQuery(normalized)

    if (normalized === queryFromUrl.trim()) {
      setLoading(true)
      setError(null)
      if (reloadTimerRef.current !== null) {
        window.clearTimeout(reloadTimerRef.current)
      }
      reloadTimerRef.current = window.setTimeout(() => {
        setRefreshToken((prev) => prev + 1)
        reloadTimerRef.current = null
      }, 1000)
      return
    }

    const nextParams = new URLSearchParams(params)
    if (normalized) {
      nextParams.set("q", normalized)
    } else {
      nextParams.delete("q")
    }

    navigate(`/discover/map${nextParams.toString() ? `?${nextParams.toString()}` : ""}`)
  }

  return (
    <div className="min-h-screen bg-background">
            <main className="pt-6 max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">Map & Results</p>
            <h1 className="text-3xl font-bold text-foreground">Map the matches in real time</h1>
            <p className="text-muted-foreground">Filter by intent, watch the list and map stay in sync, then jump into chat or brokers.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/discover/assistant")}>Open AI assistant</Button>
        </div>

        <NaturalLanguageSearch
          defaultQuery={queryFromUrl}
          onSearch={handleSearch}
        />

        <DiscoveryFilters
          propertyType={propertyType}
          onPropertyTypeChange={setPropertyType}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          bedrooms={bedrooms}
          onBedroomsChange={setBedrooms}
          sort={sort}
          onSortChange={setSort}
        />

        {loading && <p className="text-sm text-muted-foreground">Loading map results...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && (
          <MapResults
            listings={filteredListings}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              navigate(`/discover/listings/${id}`)
            }}
            onConnect={(id) => navigate(`/discover/connect?listingId=${id}`)}
            onAskAI={(id) => navigate(`/discover/assistant?listingId=${id}`)}
          />
        )}
      </main>
    </div>
  )
}
