"use client"

import { useMemo, useState } from "react"
import { Sparkles, Send, MapPin, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Listing } from "@/lib/types"

interface Message {
  id: string
  author: "user" | "assistant"
  text: string
  createdAt: string
}

interface ChatAssistantProps {
  suggestedListings: Listing[]
  onViewListing: (id: string) => void
  defaultQuery?: string
}

function createReply(query: string, listing?: Listing): string {
  const summary = query ? `You asked for: "${query}".` : "Here are personalized options."
  const listingLine = listing
    ? `This one matches best: ${listing.title} at $${listing.price?.toLocaleString()} in ${listing.location?.district || listing.location?.city}.`
    : "I can refine by price, beds, commute time, or school rating."
  return `${summary} ${listingLine}`
}

export function ChatAssistant({ suggestedListings, onViewListing, defaultQuery = "" }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      author: "assistant",
      text: "Hi! Tell me what you need and I will shortlist options, compare, and schedule tours.",
      createdAt: new Date().toISOString(),
    },
    defaultQuery
      ? {
          id: "m2",
          author: "user",
          text: defaultQuery,
          createdAt: new Date().toISOString(),
        }
      : null,
  ].filter(Boolean) as Message[])
  const [input, setInput] = useState("")

  const topPick = useMemo(() => suggestedListings[0], [suggestedListings])

  const handleSend = () => {
    if (!input.trim()) return
    const userMessage: Message = {
      id: crypto.randomUUID(),
      author: "user",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    }
    const reply: Message = {
      id: crypto.randomUUID(),
      author: "assistant",
      text: createReply(input.trim(), topPick),
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage, reply])
    setInput("")
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI home hunter</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask for lifestyle, budget, commute, or school preferences. I will map them to listings and brokers.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-80 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <div className="mt-1 rounded-full h-7 w-7 flex items-center justify-center bg-primary/10 text-primary">
                {m.author === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{m.author === "assistant" ? "Assistant" : "You"}</p>
                <p className="text-sm text-foreground leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {topPick && (
          <div className="rounded-lg border border-border p-3 bg-card">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">Top pick right now</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {topPick.location?.district || topPick.location?.city}
                </p>
              </div>
              <Button size="sm" onClick={() => onViewListing(topPick.id)}>View</Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Ask anything about homes or areas"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
