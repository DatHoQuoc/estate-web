import {
  ReconciliationSummary, MonthlyReport, TransactionRecord,
  ReconcileRequest, ManualAdjustmentRequest, AuditNoteRequest,
  ResolveDiscrepancyRequest, ExpenseCreateRequest,
} from "./finance-type";

const BASE = "/api/reconciliation";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) { const text = await res.text().catch(() => res.statusText); throw new Error(text || `HTTP ${res.status}`); }
  return res.json() as Promise<T>;
}

export const getReconciliationSummary = (month: number, year: number) =>
  apiFetch<ReconciliationSummary>(`${BASE}/${month}/${year}`);

export const runReconciliation = (month: number, year: number, payload: ReconcileRequest, adminId: string) =>
  apiFetch(`${BASE}/${month}/${year}/reconcile`, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", "X-User-Id": adminId } });

export const getAudit = (month: number, year: number) =>
  apiFetch<{ totalCount: number; matchedCount: number; unmatchedCount: number; partialCount: number; entries: TransactionRecord[] }>(`${BASE}/${month}/${year}/audit`);

export const applyManualAdjustment = (payload: ManualAdjustmentRequest, adminId: string) =>
  apiFetch(`${BASE}/adjust`, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", "X-User-Id": adminId } });

export const updateAuditNote = (auditEntryId: number, payload: AuditNoteRequest, adminId: string) =>
  apiFetch(`${BASE}/audit/${auditEntryId}/note`, { method: "PATCH", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", "X-User-Id": adminId } });

export const resolveDiscrepancy = (reconciliationId: number, payload: ResolveDiscrepancyRequest, adminId: string) =>
  apiFetch(`${BASE}/${reconciliationId}/resolve`, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", "X-User-Id": adminId } });

export const getMonthlyReport = (reconciliationId: number) =>
  apiFetch<MonthlyReport>(`${BASE}/${reconciliationId}/report`);

export const exportReport = (reconciliationId: number) =>
  apiFetch<string>(`${BASE}/${reconciliationId}/export`, { method: "POST" });

export const emailReport = (reconciliationId: number, adminId: string) =>
  apiFetch(`${BASE}/${reconciliationId}/email`, { method: "POST", headers: { "X-User-Id": adminId } });

export const getReconciliationHistory = () =>
  apiFetch<{ id: number; month: number; year: number; status: string; netProfit: number }[]>(`${BASE}/history`);

export const addExpense = (payload: ExpenseCreateRequest, adminId: string) =>
  apiFetch(`${BASE}/expenses`, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", "X-User-Id": adminId } });