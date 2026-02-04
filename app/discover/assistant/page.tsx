"use client"

import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ChatAssistant } from "@/components/buyer/chat-assistant"
import { mockListings, mockUser } from "@/lib/mock-data"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"

export default function AssistantPage() {
  const [params] = useSearchParams()
  const listingId = params.get("listingId")
  const navigate = useNavigate()
  const suggested = useMemo(() => {
    if (listingId) {
      const match = mockListings.find((l) => l.id === listingId)
      if (match) return [match, ...mockListings.filter((l) => l.id !== listingId)].slice(0, 4)
    }
    return mockListings.slice(0, 4)
  }, [listingId])

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      <main className="pt-16 max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Screen 4 • AI assistant</p>
            <h1 className="text-3xl font-bold text-foreground">Ask anything and route to brokers</h1>
          </div>
          <Button variant="secondary" onClick={() => navigate("/discover/map")}>Back to map</Button>
        </div>

        <ChatAssistant
          suggestedListings={suggested}
          defaultQuery={params.get("q") || "Find me walkable, pet-friendly condos under $3k"}
          onViewListing={(id) => navigate(`/discover/listings/${id}`)}
        />
      </main>
    </div>
  )
}
