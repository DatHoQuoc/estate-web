import React, { useState } from 'react';
import { useCredit } from '@/components/credit/CreditContext';
import type { Transaction, RefundReason } from '@/lib/creditType';
import { format, parseISO } from 'date-fns';
import {
  AlertCircle, CheckCircle, Clock, XCircle,
  FileText, ArrowUpRight, ArrowDownRight, RefreshCcw, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const FILTERS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'TOP_UP', label: 'Nạp tiền' },
  { key: 'USAGE', label: 'Sử dụng' },
  { key: 'REFUND', label: 'Hoàn tiền' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

const statusConfig: Record<Transaction['status'], { label: string; icon: React.ReactNode; class: string }> = {
  COMPLETED: { label: 'Completed', icon: <CheckCircle size={12} />, class: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
  PENDING: { label: 'Pending', icon: <Clock size={12} />, class: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' },
  REJECTED: { label: 'Rejected', icon: <XCircle size={12} />, class: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
  FAILED: { label: 'Failed', icon: <XCircle size={12} />, class: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
};

export const TransactionHistory = () => {
  const { transactions } = useCredit();
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'ALL') return true;
    if (filter === 'TOP_UP') return tx.type === 'TOP_UP';
    if (filter === 'USAGE') return tx.type === 'AI_CHAT' || tx.type === 'POST_CREATION';
    if (filter === 'REFUND') return tx.type === 'REFUND';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground mt-1">Lịch sử giao dịch và sử dụng Credit của bạn</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                filter === f.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Giao dịch</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Số lượng</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Thời gian</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={44} className="opacity-20" />
                      <p>Không có giao dịch nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const status = statusConfig[tx.status] || {
                    label: tx.status || "UNKNOWN",
                    icon: <AlertCircle size={12} />,
                    class: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  };
                  return (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      {/* Description */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            tx.amount > 0 ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : tx.amount < 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-muted text-muted-foreground"
                          )}>
                            {tx.amount > 0 ? <ArrowDownRight size={18} />
                              : tx.amount < 0 ? <ArrowUpRight size={18} />
                                : <RefreshCcw size={18} />}
                          </div>
                          <div>
                            <p className="font-semibold leading-tight">{tx.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ID: {String(tx.id).slice(0, 8)}
                              {tx.reference && <> · Ref: {tx.reference}</>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          "font-bold text-base",
                          tx.amount > 0 ? "text-green-600 dark:text-green-400"
                            : tx.amount < 0 ? "text-red-600 dark:text-red-400"
                              : ""
                        )}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">CR</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          status.class
                        )}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {tx.date ? format(parseISO(tx.date), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        {tx.amount < 0 && tx.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs h-7"
                            onClick={() => setSelectedTxForRefund(tx)}
                          >
                            Yêu cầu hoàn tiền
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTxForRefund && (
        <RefundModal
          transaction={selectedTxForRefund}
          isOpen={!!selectedTxForRefund}
          onClose={() => setSelectedTxForRefund(null)}
        />
      )}
    </div>
  );
};

// ─── Refund Modal ────────────────────────────────────────────────────────────

interface RefundModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

const RefundModal: React.FC<RefundModalProps> = ({ transaction, isOpen, onClose }) => {
  const { submitRefundRequest, refundRequests } = useCredit();
  const [reason, setReason] = useState<RefundReason>('SYSTEM_ERROR');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const existingReq = refundRequests.find(r => r.transactionId === transaction.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    setError(null);

    if (description.trim().length < 10) {
      setError('Vui lòng mô tả chi tiết sự việc (ít nhất 10 ký tự).');
      return;
    }

    setIsSending(true);
    try {
      const res = await submitRefundRequest(transaction.id, reason, description);
      if (res.success) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      } else {
        setError(res.message);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle size={18} />
            Yêu cầu hoàn tiền
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {existingReq ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4 text-sm">
              <p className="font-semibold mb-1">Đã gửi yêu cầu</p>
              <p className="text-muted-foreground">
                Bạn đã gửi yêu cầu hoàn tiền vào lúc{' '}
                {format(parseISO(existingReq.date), 'dd/MM/yyyy HH:mm')}.
                Trạng thái: <strong>{existingReq.status}</strong>
              </p>
            </div>
          ) : success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 flex items-center gap-2 p-4 text-sm text-green-700 dark:text-green-400">
              <CheckCircle size={16} />
              Đã gửi yêu cầu hoàn tiền thành công! Admin sẽ xem xét sớm.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tx info */}
              <div className="rounded-lg bg-muted/50 border p-3 text-sm space-y-1">
                <p className="font-semibold">Chi tiết giao dịch:</p>
                <p className="text-muted-foreground truncate">{transaction.description}</p>
                <p className="font-bold text-destructive">Trừ: {-transaction.amount} Credit</p>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label>Lý do hoàn tiền <span className="text-destructive">*</span></Label>
                <Select value={reason} onValueChange={(v) => setReason(v as RefundReason)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM_ERROR">Lỗi hệ thống</SelectItem>
                    <SelectItem value="WRONG_DEDUCTION">Bị trừ nhầm</SelectItem>
                    <SelectItem value="OTHER">Tranh chấp khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Mô tả sự việc <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSending}
                  rows={4}
                />
              </div>

              {/* File */}
              <div className="space-y-1.5">
                <Label>Bằng chứng đính kèm <span className="text-muted-foreground font-normal">(Tùy chọn)</span></Label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-xs file:font-medium file:bg-muted file:text-foreground hover:file:bg-accent cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Chấp nhận ảnh chụp màn hình (PNG, JPG).</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button type="submit" variant="destructive" className="flex-1" disabled={isSending}>
                  {isSending ? <><Loader2 size={15} className="mr-2 animate-spin" /> Đang gửi...</> : 'Gửi Yêu Cầu'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};