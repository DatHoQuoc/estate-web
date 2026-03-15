import {
  ReconciliationSummary, MonthlyReport, TransactionRecord,
  ReconcileRequest, ManualAdjustmentRequest, AuditNoteRequest,
  ResolveDiscrepancyRequest, ExpenseCreateRequest,
} from "./finance-type";
import { fetchJson } from "./api-client";

const BASE = import.meta.env.VITE_TRANSACTION_API_BASE_URL + "/reconciliation";

export const getReconciliationSummary = (month: number, year: number) =>
  fetchJson<ReconciliationSummary>(`${BASE}/${month}/${year}`);

export const runReconciliation = (month: number, year: number, payload: ReconcileRequest) =>
  fetchJson(`${BASE}/${month}/${year}/reconcile`, { method: "POST", body: JSON.stringify(payload) });

export const getAudit = (month: number, year: number) =>
  fetchJson<{ totalCount: number; matchedCount: number; unmatchedCount: number; partialCount: number; entries: TransactionRecord[] }>(`${BASE}/${month}/${year}/audit`);

export const applyManualAdjustment = (payload: ManualAdjustmentRequest) =>
  fetchJson(`${BASE}/adjust`, { method: "POST", body: JSON.stringify(payload) });

export const updateAuditNote = (auditEntryId: number, payload: AuditNoteRequest) =>
  fetchJson(`${BASE}/audit/${auditEntryId}/note`, { method: "PATCH", body: JSON.stringify(payload) });

export const resolveDiscrepancy = (reconciliationId: number, payload: ResolveDiscrepancyRequest) =>
  fetchJson(`${BASE}/${reconciliationId}/resolve`, { method: "POST", body: JSON.stringify(payload) });

export const getMonthlyReport = (reconciliationId: number) =>
  fetchJson<MonthlyReport>(`${BASE}/${reconciliationId}/report`);

export const exportReport = (reconciliationId: number) =>
  fetchJson<string>(`${BASE}/${reconciliationId}/export`, { method: "POST" });

export const emailReport = (reconciliationId: number) =>
  fetchJson(`${BASE}/${reconciliationId}/email`, { method: "POST" });

export const getReconciliationHistory = () =>
  fetchJson<{ id: number; month: number; year: number; status: string; netProfit: number }[]>(`${BASE}/history`);

export const addExpense = (payload: ExpenseCreateRequest) =>
  fetchJson(`${BASE}/expenses`, { method: "POST", body: JSON.stringify(payload) });