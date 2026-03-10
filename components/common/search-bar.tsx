"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: () => void
  className?: string
}

export function SearchBar({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  onSearch,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || "")
  const value = controlledValue !== undefined ? controlledValue : internalValue

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && value) {
        onSearch()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [value, onSearch])

  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const handleClear = () => {
    handleChange("")
  }

  return (
    <div className={`relative w-full max-w-sm group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
        <Search className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 pr-10 h-11 border-border/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm focus-visible:shadow-md focus-visible:ring-primary/20 transition-all duration-300 rounded-xl"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors duration-200"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
