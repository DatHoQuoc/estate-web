"use client"
import { Check, MapPin, Bed, Bath, Square, Calendar, Compass, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ReviewData {
  propertyType: string
  transactionType: string
  title: string
  description: string
  address: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  features: string[]
  yearBuilt: number | null
  floor: number | null
  direction: string
  legalStatus: string
  images: { id: string; preview: string; isCover: boolean }[]
}

interface Step4ReviewProps {
  data: ReviewData
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
}

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  land: "Land",
  office: "Office",
  commercial: "Commercial",
}

const directionLabels: Record<string, string> = {
  north: "North",
  south: "South",
  east: "East",
  west: "West",
  northeast: "Northeast",
  northwest: "Northwest",
  southeast: "Southeast",
  southwest: "Southwest",
}

const legalStatusLabels: Record<string, string> = {
  "red-book": "Red Book",
  "pink-book": "Pink Book",
  contract: "Contract",
  none: "None",
}

const amenityLabels: Record<string, string> = {
  pool: "Swimming Pool",
  gym: "Gym",
  parking: "Parking",
  security: "24/7 Security",
  elevator: "Elevator",
  garden: "Garden",
  balcony: "Balcony",
}

const featureLabels: Record<string, string> = {
  furnished: "Furnished",
  "pet-friendly": "Pet-friendly",
  "newly-built": "Newly Built",
  renovated: "Renovated",
}

export function Step4Review({ data, termsAccepted, onTermsChange }: Step4ReviewProps) {
  const coverImage = data.images.find((img) => img.isCover) || data.images[0]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Listing Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Preview */}
            {coverImage && (
              <div className="relative w-full md:w-64 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={coverImage.preview || "/placeholder.svg"}
                  alt={data.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {data.images.length} photos
                </div>
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                    {propertyTypeLabels[data.propertyType]} for{" "}
                    {data.transactionType === "sale" ? "Sale" : "Rent"}
                  </span>
                  <h3 className="text-lg font-semibold line-clamp-2">{data.title}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {data.address}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(data.price)}
                  {data.transactionType === "rental" && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  {data.area} m²
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {data.bedrooms} bed
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {data.bathrooms} bath
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Listing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">
              {data.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.yearBuilt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Year Built</p>
                  <p className="text-sm font-medium">{data.yearBuilt}</p>
                </div>
              </div>
            )}
            {data.floor && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Floor</p>
                  <p className="text-sm font-medium">{data.floor}</p>
                </div>
              </div>
            )}
            {data.direction && (
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Direction</p>
                  <p className="text-sm font-medium">
                    {directionLabels[data.direction] || data.direction}
                  </p>
                </div>
              </div>
            )}
            {data.legalStatus && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Legal Status</p>
                  <p className="text-sm font-medium">
                    {legalStatusLabels[data.legalStatus] || data.legalStatus}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          {data.amenities.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {data.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                    {amenityLabels[amenity] || amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {data.features.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <div className="flex flex-wrap gap-2">
                {data.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                    {featureLabels[feature] || feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsChange(checked as boolean)}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-relaxed cursor-pointer"
            >
              I confirm that all information provided is accurate and I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Listing Guidelines
              </a>
              . I understand that my listing will be reviewed by AI and staff before
              being published.
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
