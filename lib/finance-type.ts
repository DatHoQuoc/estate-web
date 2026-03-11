export interface FinanceSummary {
    month: string
    totalRevenue: number
    totalRefunds: number
    expenses: number
    netRevenue: number
}

export interface GatewayRecord {
    transactionId: string
    amount: number
    status: string
    createAt: string
    referenceId?: string
}

export interface FinanceExpense {
    category: string
    amount: number
}

export interface MonthlyFinanceReport {
    month: String
    revenue: number 
    refunds: number
    expenses: number
    profit: number
}