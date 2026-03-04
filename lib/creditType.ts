export type TransactionType = 'TOP_UP' | 'AI_CHAT' | 'POST_CREATION' | 'REFUND';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REJECTED';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number; // positive for top-up/refund, negative for usage
    date: string; // ISO string
    status: TransactionStatus;
    reference?: string; // e.g., Post ID, PayOS order ID
    description: string;
}

export type RefundReason = 'SYSTEM_ERROR' | 'WRONG_DEDUCTION' | 'OTHER';

export interface RefundRequest {
    id: string;
    transactionId: string;
    reason: RefundReason;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    date: string;
}

export interface UserStats {
    hasPostedBefore: boolean;
    aiMessagesToday: number;
    lastAiMessageDate: string | null;
}
