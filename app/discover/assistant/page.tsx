"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { ChatAssistant } from "@/components/buyer/chat-assistant"

export default function AssistantPage() {
  const [params] = useSearchParams()
  const listingId = params.get("listingId")
  const sessionId = params.get("sessionId")
  const query = params.get("q") || ""
  const autoSendDefaultQuery = params.get("autoSend") === "1" && query.trim().length > 0
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

  const handleAutoSentDefaultQuery = () => {
    const nextParams = new URLSearchParams(params)
    nextParams.delete("autoSend")
    nextParams.delete("q")
    const queryString = nextParams.toString()
    navigate(`/discover/assistant${queryString ? `?${queryString}` : ""}`, { replace: true })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ChatAssistant
        defaultQuery={query}
        autoSendDefaultQuery={autoSendDefaultQuery}
        startNewSessionOnAutoSend={autoSendDefaultQuery}
        onAutoSentDefaultQuery={handleAutoSentDefaultQuery}
        initialSessionId={sessionId}
        onSessionChange={handleSessionChange}
        listingId={listingId}
        onViewListing={(id) => navigate(`/discover/listings/${id}`)}
      />
    </div>
  )
}
