"use client"

import { useState, useCallback, lazy, Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, UploadCloud, FileText, X, Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"


// Standard React lazy loading for the Map component
const MapPicker = lazy(() => import("./mapPicker"))

interface ListingFormData {
  latitude: number
  longitude: number
  width?: number
  length?: number
  frontage?: number
  roadWidth?: number
  legalStatus?: string
  furnitureStatus?: string
  yearBuilt: number | null
  floor: number | null
  direction: string
  amenities: string[]
  features: string[]
}

interface Step2DetailsProps {
  data: ListingFormData
  onChange: (field: keyof ListingFormData, value: any) => void
}

const amenityOptions = [
  { value: "pool", label: "Swimming Pool" },
  { value: "gym", label: "Gym / Fitness Center" },
  { value: "parking", label: "Parking" },
  { value: "security", label: "24/7 Security" },
  { value: "elevator", label: "Elevator" },
  { value: "garden", label: "Garden" },
  { value: "balcony", label: "Balcony" },
]

const featureOptions = [
  { value: "furnished", label: "Furnished" },
  { value: "pet-friendly", label: "Pet-friendly" },
  { value: "newly-built", label: "Newly Built" },
  { value: "renovated", label: "Renovated" },
]

const directionOptions = [
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "northeast", label: "Northeast" },
  { value: "northwest", label: "Northwest" },
  { value: "southeast", label: "Southeast" },
  { value: "southwest", label: "Southwest" },
]

const legalStatusOptions = [
  { value: "red-book", label: "Red Book (Full ownership)" },
  { value: "pink-book", label: "Pink Book (Land use right)" },
  { value: "contract", label: "Contract Only" },
  { value: "none", label: "None / Other" },
]

export function Step2Details({ data, onChange }: Step2DetailsProps) {
  const [files, setFiles] = useState<File[]>([])

  /**
   * Prevents re-renders of the Map component when unrelated fields change.
   * Maps (lat, lng) from MapPicker to the parent's (field, value) structure.
   */
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    onChange("latitude", lat)
    onChange("longitude", lng)
  }, [onChange])


  const handleAmenityChange = (value: string, checked: boolean) => {
    const newAmenities = checked
      ? [...data.amenities, value]
      : data.amenities.filter((a) => a !== value)
    onChange("amenities", newAmenities)
  }

  const handleFeatureChange = (value: string, checked: boolean) => {
    const newFeatures = checked
      ? [...data.features, value]
      : data.features.filter((f) => f !== value)
    onChange("features", newFeatures)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
      // Logic for actual document upload to API would go here
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNumberChange = (field: keyof ListingFormData, value: string) => {
    const num = value === "" ? 0 : Number(value)
    onChange(field, num)
  }

  return (
    <div className="space-y-6">
      {/* 1. GEOLOCATION MAP SECTION */}
      {/* <Card className="overflow-hidden border-primary/10 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Property Geolocation
              </CardTitle>
              <CardDescription>Search for an address or drag the pin to the exact plot</CardDescription>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Coordinates</div>
              <div className="text-sm font-mono bg-muted px-2 py-0.5 rounded border border-border">
                {data.latitude?.toFixed(6)}, {data.longitude?.toFixed(6)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t relative">
          <div className="min-h-[400px] w-full bg-muted/30">
            <Suspense fallback={
              <div className="h-[400px] w-full flex flex-col items-center justify-center gap-3">
                <MapPin className="h-10 w-10 text-primary/40 animate-bounce" />
                <span className="text-sm font-medium text-muted-foreground">Loading Map Interface...</span>
              </div>
            }>
              <MapPicker 
                lat={data.latitude || 10.762622} 
                lng={data.longitude || 106.660172} 
                onChange={handleLocationChange}
              />
            </Suspense>
          </div>
        </CardContent>
      </Card> */}
            <Card>
        <CardHeader>
          <CardTitle className="text-lg">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${option.value}`}
                  checked={data.amenities.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleAmenityChange(option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`amenity-${option.value}`}
                  className="font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {featureOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${option.value}`}
                  checked={data.features.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleFeatureChange(option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`feature-${option.value}`}
                  className="font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                placeholder="e.g., 2020"
                value={data.yearBuilt || ""}
                onChange={(e) =>
                  onChange(
                    "yearBuilt",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Floor Number</Label>
              <Input
                id="floor"
                type="number"
                placeholder="e.g., 5"
                value={data.floor || ""}
                onChange={(e) =>
                  onChange("floor", e.target.value ? Number(e.target.value) : null)
                }
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction Facing</Label>
              <Select
                value={data.direction}
                onValueChange={(value) => onChange("direction", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  {directionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalStatus">Legal Status</Label>
              <Select
                value={data.legalStatus}
                onValueChange={(value) => onChange("legalStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select legal status" />
                </SelectTrigger>
                <SelectContent>
                  {legalStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 2. TECHNICAL SPECIFICATIONS */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Property Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Width (m)", id: "width" },
              { label: "Length (m)", id: "length" },
              { label: "Frontage (m)", id: "frontage" },
              { label: "Road Width (m)", id: "roadWidth" },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-xs font-semibold">{field.label}</Label>
                <Input 
                  id={field.id}
                  type="number" 
                  placeholder="0.0"
                  value={data[field.id as keyof ListingFormData] || ""} 
                  onChange={(e) => handleNumberChange(field.id as keyof ListingFormData, e.target.value)} 
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Legal Status</Label>
              <Select value={data.legalStatus} onValueChange={(val) => onChange("legalStatus", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ownership status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red-book">Sổ Đỏ / Sổ Hồng (Full Ownership)</SelectItem>
                  <SelectItem value="contract">Hợp đồng mua bán (Sales Contract)</SelectItem>
                  <SelectItem value="waiting">Chờ sổ (In Progress)</SelectItem>
                  <SelectItem value="none">Giấy tay (Handwritten)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Interior / Furniture</Label>
              <Select value={data.furnitureStatus} onValueChange={(val) => onChange("furnitureStatus", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select furniture status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Fully Furnished (Nội thất đầy đủ)</SelectItem>
                  <SelectItem value="basic">Basic (Nội thất cơ bản)</SelectItem>
                  <SelectItem value="none">Empty / Raw (Nhà thô / Trống)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. LEGAL DOCUMENTS SECTION */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Legal Documents
          </CardTitle>
          <CardDescription>Uploading proof of ownership increases listing verification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="group relative border-2 border-dashed border-muted-foreground/20 rounded-xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            onClick={() => document.getElementById('legal-file-upload')?.click()}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3 group-hover:text-primary group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold">Click or drag & drop files</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (Max 10MB each)</p>
            <input 
              id="legal-file-upload" 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border text-sm group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded border">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[150px] md:max-w-md">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/80 leading-relaxed italic">
              Verified documents help buyers make decisions faster. All documents are kept confidential and only used for internal verification purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}