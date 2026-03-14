"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { ChatAssistant } from "@/components/buyer/chat-assistant"

export default function AssistantPage() {
  const [params] = useSearchParams()
  const listingId = params.get("listingId")
  const sessionId = params.get("sessionId")
  const navigate = useNavigate()

  const handleSessionChange = (nextSessionId: string | null) => {
    const nextParams = new URLSearchParams(params)
    if (nextSessionId) {
      nextParams.set("sessionId", nextSessionId)
    } else {
      nextParams.delete("sessionId")
    }
    const query = nextParams.toString()
    navigate(`/discover/assistant${query ? `?${query}` : ""}`, { replace: true })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ChatAssistant
        defaultQuery={params.get("q") || ""}
        initialSessionId={sessionId}
        onSessionChange={handleSessionChange}
        listingId={listingId}
        onViewListing={(id) => navigate(`/discover/listings/${id}`)}
      />
    </div>
  )
}
