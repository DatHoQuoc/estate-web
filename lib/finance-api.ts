const FINANCE_API =
  import.meta.env.VITE_TRANSACTION_API_BASE_URL ||
  "http://localhost:8086/api/v1"

// ---------------------------------------------
// base helper (reuse style credit-api)
// ---------------------------------------------

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
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


// ---------------------------------------------
// FINANCE API
// ---------------------------------------------

export async function getReconciliationSummary(month: string) {

  const [year, m] = month.split("-")

  return fetchJson(
    `${FINANCE_API}/finance/summary?month=${m}&year=${year}`
  )
}