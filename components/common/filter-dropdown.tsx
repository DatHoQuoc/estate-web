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
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
      <Select value={selected} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] h-11 border-border/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm hover:bg-white/80 dark:hover:bg-zinc-800/80 focus:ring-primary/20 transition-all duration-300 rounded-xl font-medium">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-xl border-border/50 backdrop-blur-xl bg-white/95 dark:bg-zinc-950/95 overflow-hidden">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="rounded-lg my-0.5 cursor-pointer font-medium focus:bg-primary/10 focus:text-primary transition-colors"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
