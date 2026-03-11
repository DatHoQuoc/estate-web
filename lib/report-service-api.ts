import { FeedbackResponse } from "@/lib/report-service-type"
const API_BASE = import.meta.env.VITE_API_BASE_REPORTING || "http://localhost:8083"

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),

      ...init?.headers,
    },
    ...init,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function getFeedbackBySeller(): Promise<FeedbackResponse[]> {
  const feedbacks = await fetchJson<FeedbackResponse[]>(
    `${API_BASE}/api/v1/feedback/seller`
  )
  return feedbacks
}

export async function getFeedbackByListing(listingId: string): Promise<FeedbackResponse[]> {
  const feedbacks = await fetchJson<FeedbackResponse[]>(
    `${API_BASE}/api/v1/feedback/listing/${listingId}`
  )
  return feedbacks
}

export async function approveFeedback(
  feedbackId: string,
  notes?: string
): Promise<FeedbackResponse> {
  const queryParams = notes ? `?notes=${encodeURIComponent(notes)}` : '';
  const url = `${API_BASE}/api/v1/feedback/${feedbackId}/approve${queryParams}`;

  return fetchJson<FeedbackResponse>(url, {
    method: "PUT",
  });
}