"use client"

import { Input } from "@/components/ui/input"
import { FilterDropdown } from "@/components/common/filter-dropdown"
import { Card, CardContent } from "@/components/ui/card"

interface DiscoveryFiltersProps {
  propertyType?: string
  onPropertyTypeChange: (value: string) => void
  minPrice?: string
  maxPrice?: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  bedrooms?: string
  onBedroomsChange: (value: string) => void
  sort?: string
  onSortChange: (value: string) => void
}

const propertyTypes = [
  { value: "all", label: "Any type" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Office" },
  { value: "commercial", label: "Commercial" },
]

const bedroomOptions = [
  { value: "any", label: "Any beds" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
]

const sortOptions = [
  { value: "relevance", label: "Best match" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "new", label: "Newest" },
]

export function DiscoveryFilters({
  propertyType = "all",
  minPrice = "",
  maxPrice = "",
  bedrooms = "any",
  sort = "relevance",
  onPropertyTypeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onBedroomsChange,
  onSortChange,
}: DiscoveryFiltersProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-5 gap-4">
        <FilterDropdown
          options={propertyTypes}
          selected={propertyType}
          onChange={onPropertyTypeChange}
          label="Property"
        />
        <div className="flex items-center gap-2">
          <div className="w-full">
            <label className="text-xs text-muted-foreground">Min price</label>
            <Input
              placeholder="$"
              value={minPrice}
              inputMode="numeric"
              onChange={(e) => onMinPriceChange(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="text-xs text-muted-foreground">Max price</label>
            <Input
              placeholder="$"
              value={maxPrice}
              inputMode="numeric"
              onChange={(e) => onMaxPriceChange(e.target.value)}
            />
          </div>
        </div>
        <FilterDropdown
          options={bedroomOptions}
          selected={bedrooms}
          onChange={onBedroomsChange}
          label="Bedrooms"
        />
        <FilterDropdown
          options={sortOptions}
          selected={sort}
          onChange={onSortChange}
          label="Sort"
        />
      </CardContent>
    </Card>
  )
}
