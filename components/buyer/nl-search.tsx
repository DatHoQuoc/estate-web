
import { FormEvent, useState } from "react"
import { Sparkles, Mic, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NaturalLanguageSearchProps {
  defaultQuery?: string
  onSearch: (query: string) => void
}

const promptChips = [
  "3 bed homes under $800k in Seattle",
  "Pet-friendly rentals near downtown",
  "Lake view villas with pools",
  "Condos with parking in SF"
]

export function NaturalLanguageSearch({ defaultQuery = "", onSearch }: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState(defaultQuery)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  const handlePromptClick = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Search with natural language</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask for homes like you talk to a friend"
                  className="pl-9 pr-24"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label="Voice input (not wired)">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="sm">Search</Button>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Try a prompt</p>
          <div className="flex flex-wrap gap-2">
            {promptChips.map((chip) => (
              <Button
                key={chip}
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => handlePromptClick(chip)}
              >
                <MapPin className="h-4 w-4 mr-1" /> {chip}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
