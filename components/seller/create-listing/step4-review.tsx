"use client"

import { useState } from "react"
import {
  Check,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Compass,
  FileText,
  ImageIcon,
  Video,
  Globe,
  AlertCircle,
  ChevronDown,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReviewImage {
  id: string
  preview: string
  url?: string
  isCover: boolean
}

interface ReviewImage360 {
  id: string
  sceneId?: string
  preview: string
  url?: string
  sceneName: string
}

interface ReviewVideo {
  id: string
  videoId?: string
  preview: string
  url?: string
  file?: File
}

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
  images: ReviewImage[]
  images360: ReviewImage360[]
  videos: ReviewVideo[]
}

interface Step4ReviewProps {
  data: ReviewData
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
}

// ─── Label Maps ──────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

// ─── Validation ──────────────────────────────────────────────────────────────

interface CheckItem {
  key: string
  label: string
  passed: boolean
}

function buildChecklist(data: ReviewData): CheckItem[] {
  const pendingMedia =
    data.images.some((img) => !img.url && !img.isCover === false) === false &&
    data.images360.some((img) => !img.sceneId) === false &&
    data.videos.some((v) => !v.videoId) === false

  return [
    {
      key: "images",
      label: "At least 5 photos",
      passed: data.images.length >= 5,
    },
    {
      key: "cover",
      label: "Cover image set",
      passed: data.images.some((img) => img.isCover),
    },
    {
      key: "title",
      label: "Title provided",
      passed: data.title.trim().length > 0,
    },
    {
      key: "description",
      label: "Description provided",
      passed: data.description.trim().length > 0,
    },
    {
      key: "address",
      label: "Address provided",
      passed: data.address.trim().length > 0,
    },
    {
      key: "price",
      label: "Price set",
      passed: data.price > 0,
    },
    {
      key: "media_synced",
      label: "Media saved to server",
      passed: pendingMedia,
    },
  ]
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ValidationChecklist({ items }: { items: CheckItem[] }) {
  const allPass = items.every((i) => i.passed)
  const failCount = items.filter((i) => !i.passed).length

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        allPass ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            allPass ? "text-emerald-700" : "text-amber-700"
          )}
        >
          {allPass
            ? "All checks passed"
            : `${failCount} issue${failCount > 1 ? "s" : ""} to fix`}
        </span>
        {allPass ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-600" />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <div
              className={cn(
                "h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0",
                item.passed ? "bg-emerald-500" : "bg-amber-400"
              )}
            >
              {item.passed ? (
                <Check className="h-2.5 w-2.5 text-white" />
              ) : (
                <span className="h-0.5 w-2 bg-white rounded-full" />
              )}
            </div>
            <span
              className={cn(
                "text-xs",
                item.passed ? "text-emerald-800" : "text-amber-800 font-medium"
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MediaStrip({ data }: { data: ReviewData }) {
  const cover = data.images.find((img) => img.isCover) || data.images[0]
  const otherImages = data.images
    .filter((img) => img.id !== cover?.id)
    .slice(0, 3)

  const has360 = data.images360.length > 0
  const hasVideos = data.videos.length > 0
  const saved360 = data.images360.filter((img) => img.sceneId).length
  const pending360 = data.images360.length - saved360
  const savedVideos = data.videos.filter((v) => v.videoId).length
  const pendingVideos = data.videos.length - savedVideos

  return (
    <div className="flex gap-2 items-stretch">
      {/* Cover — dominant */}
      {cover && (
        <div className="relative w-2/5 min-h-[140px] rounded-lg overflow-hidden flex-shrink-0 border border-muted">
          <img
            src={cover.preview || "/placeholder.svg"}
            alt="Cover"
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-2 pt-5">
            <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              <Star className="h-2.5 w-2.5 fill-current" />
              Cover
            </span>
          </div>
        </div>
      )}

      {/* Right column */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Thumbnails */}
        <div className="flex gap-2 flex-1">
          {otherImages.map((img) => (
            <div
              key={img.id}
              className="flex-1 rounded-lg overflow-hidden border border-muted"
            >
              <img
                src={img.preview || "/placeholder.svg"}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
          ))}
          {data.images.length > 4 && (
            <div className="flex-shrink-0 w-14 rounded-lg bg-muted border border-muted flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">
                +{data.images.length - 4}
              </span>
            </div>
          )}
        </div>

        {/* Media type badges with sync status */}
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs bg-muted border border-muted rounded-full px-2.5 py-1">
            <ImageIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {data.images.length} photos
            </span>
          </span>

          {has360 && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <Globe className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-700 font-medium">
                {data.images360.length} tour scene{data.images360.length > 1 ? "s" : ""}
              </span>
              {pending360 > 0 && (
                <span className="text-emerald-500 font-normal">
                  · {pending360} pending
                </span>
              )}
            </span>
          )}

          {hasVideos && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
              <Video className="h-3 w-3 text-blue-600" />
              <span className="text-blue-700 font-medium">
                {data.videos.length} video{data.videos.length > 1 ? "s" : ""}
              </span>
              {pendingVideos > 0 && (
                <span className="text-blue-500 font-normal">
                  · {pendingVideos} pending
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickFacts({ data }: { data: ReviewData }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Square className="h-3.5 w-3.5" />
        {data.area} m²
      </span>
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Bed className="h-3.5 w-3.5" />
        {data.bedrooms} bed
      </span>
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Bath className="h-3.5 w-3.5" />
        {data.bathrooms} bath
      </span>
      {data.direction && (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Compass className="h-3.5 w-3.5" />
          {directionLabels[data.direction] || data.direction}
        </span>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Step4Review({
  data,
  termsAccepted,
  onTermsChange,
}: Step4ReviewProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const checklist = buildChecklist(data)
  const allValid = checklist.every((c) => c.passed)

  return (
    <div className="space-y-5">
      {/* ── Validation Checklist ── */}
      <ValidationChecklist items={checklist} />

      {/* ── Preview Card ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Listing Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Media showcase */}
          <MediaStrip data={data} />

          {/* Title block */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                {propertyTypeLabels[data.propertyType] || data.propertyType}
              </span>
              <span className="text-xs text-muted-foreground">
                for {data.transactionType === "sale" ? "Sale" : "Rent"}
              </span>
            </div>
            <h3 className="text-lg font-semibold leading-snug">{data.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {data.address}
            </p>
          </div>

          {/* Price + quick facts */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-muted">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(data.price)}
              {data.transactionType === "rental" && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / month
                </span>
              )}
            </p>
            <QuickFacts data={data} />
          </div>
        </CardContent>
      </Card>

      {/* ── Full Details (Collapsible) ── */}
      <Card>
        <CardContent className="pt-4 pb-0">
          <button
            type="button"
            onClick={() => setDetailsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1"
          >
            <span className="text-base font-semibold">Full Details</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                detailsOpen && "rotate-180"
              )}
            />
          </button>
        </CardContent>

        {detailsOpen && (
          <CardContent className="pt-0 space-y-5">
            {/* Description */}
            <div className="pt-4 border-t border-muted">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Description
              </h4>
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Details grid */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Property Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.yearBuilt && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Year Built</p>
                      <p className="text-sm font-semibold">{data.yearBuilt}</p>
                    </div>
                  </div>
                )}
                {data.floor && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Floor</p>
                      <p className="text-sm font-semibold">{data.floor}</p>
                    </div>
                  </div>
                )}
                {data.direction && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Direction</p>
                      <p className="text-sm font-semibold">
                        {directionLabels[data.direction] || data.direction}
                      </p>
                    </div>
                  </div>
                )}
                {data.legalStatus && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Legal Status</p>
                      <p className="text-sm font-semibold">
                        {legalStatusLabels[data.legalStatus] || data.legalStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Virtual Tour Scene List */}
            {data.images360.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Virtual Tour Scenes
                </h4>
                <div className="space-y-1.5">
                  {data.images360.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className="flex items-center gap-3 px-3 py-2 bg-muted/40 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-md overflow-hidden border border-muted flex-shrink-0">
                        <img
                          src={scene.preview || "/placeholder.svg"}
                          alt={scene.sceneName}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {idx + 1}. {scene.sceneName}
                        </p>
                      </div>
                      {scene.sceneId ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          <Check className="h-2.5 w-2.5" />
                          Saved
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {data.amenities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-muted rounded-full text-xs text-foreground"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {amenityLabels[a] || a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {data.features.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-muted rounded-full text-xs text-foreground"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {featureLabels[f] || f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ── Action Zone ── */}
      <Card className={cn("border-2", allValid ? "border-muted" : "border-amber-200")}>
        <CardContent className="pt-5 pb-5 space-y-4">
          {/* Terms */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsChange(checked as boolean)}
              disabled={!allValid}
            />
            <Label
              htmlFor="terms"
              className={cn(
                "text-sm font-normal leading-relaxed",
                allValid ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              )}
            >
              I confirm that all information provided is accurate and I agree to
              the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Listing Guidelines
              </a>
              .
            </Label>
          </div>

          <div className="border-t border-muted" />

          {/* Submit row */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Your listing will be reviewed before it is published.
            </p>
            <button
              type="button"
              disabled={!allValid || !termsAccepted}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                allValid && termsAccepted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Publish Listing
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}