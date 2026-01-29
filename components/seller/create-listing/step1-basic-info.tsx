"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Step1BasicInfoProps {
  data: {
    propertyType: string
    transactionType: string
    title: string
    description: string
    address: string
    price: number
    area: number
    bedrooms: number
    bathrooms: number
  }
  onChange: (field: string, value: string | number) => void
}

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
  { value: "office", label: "Office" },
  { value: "commercial", label: "Commercial" },
]

export function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
  const handleCounterChange = (field: string, delta: number) => {
    const currentValue = data[field as keyof typeof data] as number
    const newValue = Math.max(0, Math.min(10, currentValue + delta))
    onChange(field, newValue)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyType">Select Property Type</Label>
            <Select
              value={data.propertyType}
              onValueChange={(value) => onChange("propertyType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup
              value={data.transactionType}
              onValueChange={(value) => onChange("transactionType", value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sale" id="sale" />
                <Label htmlFor="sale" className="font-normal cursor-pointer">
                  For Sale
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rental" id="rental" />
                <Label htmlFor="rental" className="font-normal cursor-pointer">
                  For Rent
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Modern 3-Bedroom Apartment in Downtown"
              value={data.title}
              onChange={(e) => onChange("title", e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {data.title.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your property in detail..."
              value={data.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={5}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {data.description.length}/5000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="Enter property address"
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price & Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price (USD) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={data.price || ""}
                  onChange={(e) => onChange("price", Number(e.target.value))}
                  className="pl-7"
                />
              </div>
              {data.transactionType === "rental" && (
                <p className="text-xs text-muted-foreground">per month</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">
                Area (sqm) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="area"
                  type="number"
                  placeholder="0"
                  value={data.area || ""}
                  onChange={(e) => onChange("area", Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  m²
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bedrooms</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bedrooms", -1)}
                  disabled={data.bedrooms <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">
                  {data.bedrooms}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bedrooms", 1)}
                  disabled={data.bedrooms >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bathrooms</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bathrooms", -1)}
                  disabled={data.bathrooms <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">
                  {data.bathrooms}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bathrooms", 1)}
                  disabled={data.bathrooms >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
