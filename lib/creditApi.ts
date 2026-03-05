const  CREDIT_API =
  import.meta.env.VITE_TRANSACTION_API_BASE_URL || "http://localhost:8086/api/v1"

// ------------------------------------------------
// Base request helper (same style as listing API)
// ------------------------------------------------
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

// ------------------------------------------------
// CREDIT API
// ------------------------------------------------

/**
 * GET /api/v1/credits/balance
 */
export async function getCreditBalance() {
  return fetchJson(`${CREDIT_API}/credits/balance`)
}

/**
 * GET /api/v1/credits/transactions
 */
export async function getCreditTransactions() {
  return fetchJson(`${CREDIT_API}/credits/transactions`)
}

/**
 * GET /api/v1/credits/posts/is-first
 */
export async function checkFirstPost() {
  return fetchJson(`${CREDIT_API}/credits/posts/is-first`)
}

/**
 * GET /api/v1/credits/refunds
 */
export async function getRefundRequests() {
  return fetchJson(`${CREDIT_API}/credits/refunds`)
}

/**
 * GET /api/v1/credits/refunds/pending
 */
export async function getPendingRefundRequests() {
  return fetchJson(`${CREDIT_API}/credits/refunds/pending`)
}

/**
 * POST /api/v1/credits/topup/initiate
 */
export async function initiateTopUp(amount: number) {
  return fetchJson(`${CREDIT_API}/credits/topup/initiate`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  })
}

/**
 * POST /api/v1/credits/usage/chat
 */
export async function useAiChat() {
  return fetchJson(`${CREDIT_API}/credits/usage/chat`, {
    method: "POST",
  })
}

/**
 * POST /api/v1/credits/usage/post/lock
 */
export async function lockPostCredit(postId: string) {
  return fetchJson(`${CREDIT_API}/credits/usage/post/lock`, {
    method: "POST",
    body: JSON.stringify({ postId }),
  })
}

/**
 * POST /api/v1/credits/usage/post/resolve
 */
export async function resolvePostCredit(
  transactionId: string,
  action: "APPROVE" | "REJECT"
) {
  return fetchJson(`${CREDIT_API}/credits/usage/post/resolve`, {
    method: "POST",
    body: JSON.stringify({
      transactionId,
      action,
    }),
  })
}

/**
 * POST /api/v1/credits/refunds
 */
export async function submitRefundRequest(
  transactionId: string,
  reason: string,
  description: string
) {
  return fetchJson(`${CREDIT_API}/credits/refunds`, {
    method: "POST",
    body: JSON.stringify({
      transactionId,
      reason,
      description,
    }),
  })
}