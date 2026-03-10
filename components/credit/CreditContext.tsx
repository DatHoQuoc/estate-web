import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Transaction, RefundRequest, UserStats, RefundReason } from '@/lib/creditType';
import { apiClient, ENDPOINTS } from '@/lib/../src/lib/api-client';

interface CreditContextType {
  balance: number;
  lockedBalance: number;
  transactions: Transaction[];
  refundRequests: RefundRequest[];
  stats: UserStats;
  loading: boolean;

  // Actions
  refreshData: () => Promise<void>;
  topUp: (amount: number) => Promise<void>;
  useAiChat: () => Promise<{ success: boolean; message: string; requiresTopUp?: boolean }>;
  submitPost: () => Promise<any>;
  resolvePost: (approved: boolean, transactionId: string) => Promise<void>;
  submitRefundRequest: (transactionId: string, reason: RefundReason, description: string) => Promise<{ success: boolean; message: string }>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const [lockedBalance, setLockedBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [stats, setStats] = useState<UserStats>({
    hasPostedBefore: false,
    aiMessagesToday: 0,
    lastAiMessageDate: null,
  });
  const [loading, setLoading] = useState(true);

  // ================= REFRESH =================

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);

      const [walletRes, txRes, refundRes, firstPostRes] = await Promise.all([
        apiClient.get(ENDPOINTS.CREDITS.BALANCE),
        apiClient.get(ENDPOINTS.CREDITS.TRANSACTIONS),
        apiClient.get(ENDPOINTS.CREDITS.REFUNDS),
        apiClient.get('/credits/posts/is-first')
      ]);

      const wallet = walletRes.data;

      setBalance(wallet.balance);
      setLockedBalance(wallet.lockedBalance ?? 0);
      setTransactions(txRes.data.map((tx: any) => ({
        id: String(tx.id),
        type: tx.type ?? tx.transactionType ?? "UNKNOWN",
        amount: tx.amount,
        status: tx.status,
        description: tx.description ?? tx.notes ?? "",
        date: tx.date ?? tx.createdAt ?? tx.createdDate ?? null,
        reference: tx.referenceId ?? null
      })));
      setRefundRequests(refundRes.data);

      setStats({
        hasPostedBefore: !firstPostRes.data.isFirstPost,
        aiMessagesToday: wallet.dailyMessageUsed ?? 0,
        lastAiMessageDate: null
      });

    } catch (err) {
      console.error("Failed to refresh data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ================= TOPUP =================

  const topUp = async (amount: number) => {
    await apiClient.post(ENDPOINTS.CREDITS.TOPUP_INITIATE, { amount });
    await refreshData();
  };

  // ================= AI CHAT =================

  const useAiChat = async () => {
    const res = await apiClient.post(ENDPOINTS.CREDITS.USAGE_CHAT);
    await refreshData();
    return res.data;
  };

  // ================= POST =================

  const submitPost = async () => {
    const res = await apiClient.post(ENDPOINTS.CREDITS.USAGE_POST_LOCK, {
      postId: "post-" + Date.now()
    });

    await refreshData();
    return res.data;
  };

  const resolvePost = async (approved: boolean, transactionId: string) => {
    await apiClient.post(ENDPOINTS.CREDITS.USAGE_POST_RESOLVE, {
      transactionId,
      action: approved ? "APPROVE" : "REJECT"
    });

    await refreshData();
  };

  // ================= REFUND =================

  const submitRefundRequest = async (
    transactionId: string,
    reason: RefundReason,
    description: string
  ) => {
    const res = await apiClient.post(ENDPOINTS.CREDITS.REFUNDS, {
      transactionId,
      reason,
      description
    });

    await refreshData();
    return res.data;
  };

  return (
    <CreditContext.Provider value={{
      balance,
      lockedBalance,
      transactions,
      refundRequests,
      stats,
      loading,
      refreshData,
      topUp,
      useAiChat,
      submitPost,
      resolvePost,
      submitRefundRequest
    }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredit = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredit must be used within a CreditProvider');
  }
  return context;
};
