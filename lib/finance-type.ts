export type TransactionMatchStatus = "matched" | "unmatched" | "partial" | "adjusted";

export interface TransactionRecord {
  id: string;
  date: string;
  description: string;
  systemAmount: number;
  gatewayAmount: number | null;
  matchStatus: TransactionMatchStatus;
  resolutionNote?: string;
}

export type ReconciliationStatus = "PENDING" | "RECONCILED" | "DISCREPANCY" | "RESOLVED";

export interface ReconciliationSummary {
  monthLabel: string;
  totalCreditSold: number;
  totalCreditUsed: number;
  totalRefunded: number;
  netSystemCredits: number;
  gatewayBankTransfers: number;
  gatewayEWallets: number;
  gatewayOther: number;
  totalGatewayReceived: number;
  expenseHosting: number;
  expenseAiApi: number;
  expensePaymentProcessing: number;
  expenseSupport: number;
  totalExpenses: number;
  systemTotal: number;
  gatewayTotal: number;
  discrepancyAmount: number;
  discrepancyPercent: number;
  withinTolerance: boolean;
  status: ReconciliationStatus;
  notes?: string;
  unmatchedCount: number;
  partialCount: number;
}

export interface MonthlyReport {
  id: number;
  month: string;
  monthLabel: string;
  generatedAt: string;
  totalTransactions: number;
  resolvedDiscrepancies: number;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  totalExpenses: number;
  netProfitLoss: number;
  status: ReconciliationStatus;
  expenseLines: { category: string; amount: number; description: string }[];
}

export interface ReconcileRequest {
  gatewayReceived: number;
  bankTransfers?: number;
  eWallets?: number;
  otherMethods?: number;
  totalExpenses?: number;
}

export interface ManualAdjustmentRequest {
  userId: string;
  creditAmount: number;
  reason: string;
  referenceId?: string;
}

export interface AuditNoteRequest { note: string; }
export interface ResolveDiscrepancyRequest { notes: string; }
export interface ExpenseCreateRequest {
  month: number; year: number;
  category: string; amount: number; description: string;
}