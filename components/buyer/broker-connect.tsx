"use client"

import { FormEvent, useState } from "react"
import { Phone, CalendarClock, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Listing } from "@/lib/types"

interface BrokerConnectProps {
  listing: Listing
  onSubmit?: (payload: BrokerConnectPayload) => void
}

export interface BrokerConnectPayload {
  listingId: string
  name: string
  email: string
  phone: string
  notes: string
  preferredTime: string
}

export function BrokerConnectForm({ listing, onSubmit }: BrokerConnectProps) {
  const [form, setForm] = useState<BrokerConnectPayload>({
    listingId: listing.id,
    name: "",
    email: "",
    phone: "",
    notes: `Interested in ${listing.title}. Please share availability and next steps.`,
    preferredTime: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle")

  const handleChange = (key: keyof BrokerConnectPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setTimeout(() => {
      onSubmit?.(form)
      setStatus("sent")
    }, 400)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Connect with a broker</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your details and the team will follow up to schedule a tour or answer questions.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Full name</label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Preferred time</label>
              <Input
                placeholder="e.g. Weekdays after 6pm"
                value={form.preferredTime}
                onChange={(e) => handleChange("preferredTime", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Notes</label>
            <Textarea
              rows={4}
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
            {status === "sent" ? "Request sent" : status === "submitting" ? "Sending..." : "Send request"}
          </Button>

          {status === "sent" && (
            <div className="flex items-center gap-2 text-sm text-success">
              <MessageCircle className="h-4 w-4" /> We have sent your request to a broker.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone & video tours</div>
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Same-day callbacks</div>
            <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp follow-up</div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
