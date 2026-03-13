"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { SearchListing } from "@/lib/api/search/types"
import { Button } from "@/components/ui/button"
import { SearchListingCard } from "./search-listing-card"
import { Loader2 } from "lucide-react"

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface SearchMapResultsProps {
  listings: SearchListing[]
  loading?: boolean
  selectedId?: string
  onSelect: (id: string) => void
  onConnect: (id: string) => void
  onAskAI: (id: string) => void
}

function FlyToSelection({ listings, selectedId }: { listings: SearchListing[]; selectedId?: string }) {
  const map = useMap()

  useEffect(() => {
    const target = listings.find((l) => l.id === selectedId) || listings[0]
    if (target?.location?.coordinates?.lat && target?.location?.coordinates?.lng) {
      map.flyTo([target.location.coordinates.lat, target.location.coordinates.lng], 13, {
          duration: 1.5
      })
    }
  }, [listings, selectedId, map])

  return null
}

export function SearchMapResults({ listings, loading, selectedId, onSelect, onConnect, onAskAI }: SearchMapResultsProps) {
  const center = useMemo(() => {
    const loc = listings[0]?.location?.coordinates
    return loc?.lat ? [loc.lat, loc.lng] : [40.7128, -74.006] // Default to NY
  }, [listings])

  return (
    <div className="grid lg:grid-cols-2 gap-6 min-h-[70vh] relative">
      {/* List View */}
      <div className="space-y-4 overflow-y-auto pr-1 relative" style={{ maxHeight: "75vh" }}>
        {loading ? (
             <div className="h-full flex items-center justify-center min-h-[50vh] flex-col gap-4">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-muted-foreground text-sm font-medium">Searching properties...</p>
             </div>
        ) : (
            <>
                {listings.map((listing) => (
                <SearchListingCard
                    key={listing.id}
                    listing={listing}
                    highlight={listing.id === selectedId}
                    onView={onSelect}
                    onConnect={onConnect}
                    onAskAI={onAskAI}
                />
                ))}
                {listings.length === 0 && (
                <div className="text-muted-foreground text-sm p-4 text-center border border-dashed rounded-lg">
                    No properties match your current search filters.
                </div>
                )}
            </>
        )}
      </div>

      {/* Map View */}
      <div className="h-[75vh] min-h-[400px] rounded-xl overflow-hidden shadow-sm border border-border relative">
         {loading && (
             <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
         )}
        <MapContainer center={center as [number, number]} zoom={12} scrollWheelZoom className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!loading && <FlyToSelection listings={listings} selectedId={selectedId} />}
          
          {!loading && listings.map((listing) => {
             const coords = listing.location?.coordinates;
             if (!coords) return null;
             
             return (
              <Marker
                key={listing.id}
                position={[coords.lat, coords.lng]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => onSelect(listing.id),
                }}
              >
                <Popup className="rounded-xl overflow-hidden">
                  <div className="space-y-2 !m-0 min-w-[200px]">
                    <div className="relative h-24 w-full rounded-md overflow-hidden bg-muted">
                        {listing.media.images[0]?.thumbnailUrl && (
                             <img src={listing.media.images[0].thumbnailUrl} alt={listing.title} className="object-cover w-full h-full" />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-foreground text-sm line-clamp-1">{listing.title}</p>
                        <p className="text-xs text-primary font-medium mt-1">{listing.pricing?.formattedPrice}</p>
                    </div>
                    <Button size="sm" variant="secondary" className="w-full mt-2" onClick={() => onSelect(listing.id)}>
                      View details
                    </Button>
                  </div>
                </Popup>
              </Marker>
             )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
