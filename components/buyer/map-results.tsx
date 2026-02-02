"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Listing } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/buyer/listing-card"

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface MapResultsProps {
  listings: Listing[]
  selectedId?: string
  onSelect: (id: string) => void
  onConnect: (id: string) => void
  onAskAI: (id: string) => void
}

function FlyToSelection({ listings, selectedId }: { listings: Listing[]; selectedId?: string }) {
  const map = useMap()

  useEffect(() => {
    const target = listings.find((l) => l.id === selectedId) || listings[0]
    if (target?.location?.lat && target?.location?.lng) {
      map.flyTo([target.location.lat, target.location.lng], 13)
    }
  }, [listings, selectedId, map])

  return null
}

export function MapResults({ listings, selectedId, onSelect, onConnect, onAskAI }: MapResultsProps) {
  const center = useMemo(() => {
    const loc = listings[0]?.location
    return loc?.lat ? [loc.lat, loc.lng] : [40.7128, -74.006]
  }, [listings])

  return (
    <div className="grid lg:grid-cols-2 gap-6 min-h-[70vh]">
      <div className="space-y-4 overflow-y-auto pr-1" style={{ maxHeight: "75vh" }}>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            highlight={listing.id === selectedId}
            onView={onSelect}
            onConnect={onConnect}
            onAskAI={onAskAI}
          />
        ))}
        {listings.length === 0 && (
          <div className="text-muted-foreground text-sm">No listings match your search.</div>
        )}
      </div>

      <div className="h-[75vh] rounded-lg overflow-hidden border border-border">
        <MapContainer center={center as [number, number]} zoom={12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToSelection listings={listings} selectedId={selectedId} />
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.location.lat, listing.location.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelect(listing.id),
              }}
            >
              <Popup>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-sm">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">${listing.price?.toLocaleString()}</p>
                  <Button size="sm" className="w-full" onClick={() => onSelect(listing.id)}>
                    View details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
