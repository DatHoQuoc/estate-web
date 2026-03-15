const CREDIT_API =
  import.meta.env.VITE_TRANSACTION_API_BASE_URL || "http://localhost:8086/api/v1"

export interface AdminOverviewDTO {
  totalWallets: number;
  totalTransactions: number;
  totalRevenueAllTime: number;
  totalRefundsAllTime: number;
  netRevenueAllTime: number;
  pendingRefundRequests: number;
  pendingReconciliations: number;
}

export interface AdminRevenueDTO {
  month: number;
  year: number;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
  aiChatDeductions: number;
  postCharges: number;
  listingFees: number;
  prevMonthRevenue: number;
  revenueGrowthPercent: number;
}

export interface AdminCreditUsageDTO {
  month: number;
  year: number;
  totalPurchases: number;
  totalAiChatDeductions: number;
  totalPostCharges: number;
  totalListingFees: number;
  totalRefunds: number;
  purchaseCount: number;
  aiChatCount: number;
  postChargeCount: number;
  listingFeeCount: number;
  refundCount: number;
}

export interface AdminWalletStatsDTO {
  totalWallets: number;
  totalBalanceInSystem: number;
  totalReservedBalance: number;
  averageBalance: number;
  zeroBalanceWallets: number;
}

export interface AdminUserDTO {
  userId: string;
  balance: number;
  reservedBalance: number;
  totalSpent: number;
  status: string;
  createdAt: string;
}

export interface UserWallet {
  walletId: number;
  userId: string;
  balance: number;
  reservedBalance: number;
  status: string;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminTransactionType =
  | "PURCHASE"
  | "AI_CHAT"
  | "LISTING_FEE"
  | "REFUND"
  | "POST_CHARGE";

export type AdminTransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface CreditTransaction {
  transactionId: number;
  wallet: UserWallet;
  amount: number;
  type: AdminTransactionType;
  referenceType?: string;
  referenceId?: string;
  status: AdminTransactionStatus;
  notes?: string;
  createdAt: string;
}

export type AdminTransactionSortBy =
  | "amount"
  | "date"
  | "status"
  | "type"
  | "userId"
  | "referenceType"
  | "referenceId";

export type AdminSortDir = "asc" | "desc";

export interface AdminTransactionsQuery {
  month?: number;
  year?: number;
  userIds?: string[];
  type?: AdminTransactionType;
  status?: AdminTransactionStatus;
  referenceType?: string;
  referenceId?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: AdminTransactionSortBy;
  sortDir?: AdminSortDir;
}

// ------------------------------------------------
// Base request helper (same style as listing API)
// ------------------------------------------------
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  console.log("token", localStorage.getItem("access_token"));
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

function withMonthYear(path: string, month: number, year: number) {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });
  return `${CREDIT_API}${path}?${params.toString()}`;
}

/**
 * GET /api/v1/admin/analytics/overview
 */
export async function getAdminAnalyticsOverview(): Promise<AdminOverviewDTO> {
  return fetchJson(`${CREDIT_API}/admin/analytics/overview`);
}

/**
 * GET /api/v1/admin/analytics/revenue
 */
export async function getAdminRevenueStats(month: number, year: number): Promise<AdminRevenueDTO> {
  return fetchJson(withMonthYear("/admin/analytics/revenue", month, year));
}

/**
 * GET /api/v1/admin/analytics/credit-usage
 */
export async function getAdminCreditUsage(month: number, year: number): Promise<AdminCreditUsageDTO> {
  return fetchJson(withMonthYear("/admin/analytics/credit-usage", month, year));
}

/**
 * GET /api/v1/admin/analytics/transactions
 */
export async function getAdminTransactionsByMonth(month: number, year: number): Promise<CreditTransaction[]> {
  return fetchJson(withMonthYear("/admin/analytics/transactions", month, year));
}

/**
 * GET /api/v1/admin/analytics/transactions
 */
export async function getAdminTransactions(query: AdminTransactionsQuery = {}): Promise<CreditTransaction[]> {
  const params = new URLSearchParams();

  if (query.month != null) params.set("month", String(query.month));
  if (query.year != null) params.set("year", String(query.year));
  if (query.userIds?.length) {
    query.userIds.forEach((id) => {
      if (id) params.append("userIds", id);
    });
  }
  if (query.type) params.set("type", query.type);
  if (query.status) params.set("status", query.status);
  if (query.referenceType) params.set("referenceType", query.referenceType);
  if (query.referenceId) params.set("referenceId", query.referenceId);
  if (query.minAmount != null) params.set("minAmount", String(query.minAmount));
  if (query.maxAmount != null) params.set("maxAmount", String(query.maxAmount));
  if (query.fromDate) params.set("fromDate", query.fromDate);
  if (query.toDate) params.set("toDate", query.toDate);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);

  const suffix = params.toString();
  return fetchJson(`${CREDIT_API}/admin/analytics/transactions${suffix ? `?${suffix}` : ""}`);
}

/**
 * GET /api/v1/admin/analytics/users/top-spenders
 */
export async function getAdminTopSpenders(limit = 10): Promise<AdminUserDTO[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetchJson(`${CREDIT_API}/admin/analytics/users/top-spenders?${params.toString()}`);
}

/**
 * GET /api/v1/admin/analytics/wallets
 */
export async function getAdminWalletStats(): Promise<AdminWalletStatsDTO> {
  return fetchJson(`${CREDIT_API}/admin/analytics/wallets`);
}