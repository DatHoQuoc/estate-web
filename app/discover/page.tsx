"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Compass, MapPinned } from "lucide-react"
import { NaturalLanguageSearch } from "@/components/buyer/nl-search"
import { ListingCard } from "@/components/buyer/listing-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mockListings, mockUser } from "@/lib/mock-data"
import { Navbar } from "@/components/layout/navbar"

export default function DiscoveryHomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const featured = useMemo(() => mockListings.slice(0, 3), [])

  const goToMap = (q?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    navigate(`/discover/map${params.toString() ? `?${params.toString()}` : ""}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} notificationCount={0} />
      <main className="pt-16">
        <section className="bg-muted/50 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Main Flow 2 — Discovery & Connection</p>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-3 max-w-3xl">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">Find your next home with natural language, maps, and an AI co-pilot.</h1>
                  <p className="text-muted-foreground text-lg">Search the way you talk. Preview on a live map, chat with the assistant, and hand off to a broker without friction.</p>
                </div>
                <div className="flex gap-2">
                  <Button size="lg" onClick={() => goToMap(query)}>
                    <MapPinned className="h-4 w-4 mr-2" /> Open map view
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/discover/assistant")}>Chat with AI</Button>
                </div>
              </div>
            </div>

            <NaturalLanguageSearch
              defaultQuery="3 bed homes under $800k in Seattle"
              onSearch={(value) => {
                setQuery(value)
                goToMap(value)
              }}
            />

            <Card className="border-border">
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Speak human", "See it on a map", "Connect instantly"].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item}</p>
                      <p className="text-sm text-muted-foreground">We parse intent, rank matches, and keep brokers in the loop.</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Screen 1 • Discovery Home</p>
              <h2 className="text-2xl font-bold text-foreground">Featured for you</h2>
            </div>
            <Button variant="ghost" onClick={() => goToMap(query)}>
              See all on map <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onView={(id) => navigate(`/discover/listings/${id}`)}
                onConnect={(id) => navigate(`/discover/connect?listingId=${id}`)}
                onAskAI={(id) => navigate(`/discover/assistant?listingId=${id}`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
