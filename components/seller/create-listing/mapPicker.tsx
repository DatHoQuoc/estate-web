"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default Leaflet icon not appearing in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface MapPickerProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return (
    <Marker 
      position={[lat, lng]} 
      icon={icon} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const position = marker.getLatLng()
          onChange(position.lat, position.lng)
        },
      }}
    />
  )
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  return (
    <div className="h-[350px] w-full z-0">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
    </div>
  )
}