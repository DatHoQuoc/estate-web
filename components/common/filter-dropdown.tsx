"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  options: FilterOption[]
  selected?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
}

export function FilterDropdown({
  options,
  selected,
  onChange,
  placeholder = "Filter",
  label,
}: FilterDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
      <Select value={selected} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
