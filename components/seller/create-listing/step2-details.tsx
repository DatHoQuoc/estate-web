"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Step2DetailsProps {
  data: {
    amenities: string[]
    features: string[]
    yearBuilt: number | null
    floor: number | null
    direction: string
    legalStatus: string
  }
  onChange: (field: string, value: string | number | string[] | null) => void
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

  return (
    <div className="space-y-6">
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
    </div>
  )
}
