import React, { useState } from 'react';
import { useCredit } from '@/components/credit/CreditContext';
import { PlusSquare, Info, ShieldCheck, XCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { TopUpModal } from '../components/TopUpModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const SimulateNewPost = () => {
  const { stats, balance, submitPost, resolvePost } = useCredit();
  const [title, setTitle] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [pendingTxId, setPendingTxId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const isFree = !stats.hasPostedBefore;

  const handlePreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSending) return;

    if (isFree) {
      setIsSending(true);
      try {
        const res = await submitPost();
        if (res.success) {
          setPendingTxId('free-post');
          setTimeout(() => setPendingTxId(null), 1500);
          setTitle('');
        }
      } finally {
        setIsSending(false);
      }
    } else {
      setIsConfirmOpen(true);
    }
  };

  const confirmSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSending(true);
    try {
      const res = await submitPost();
      if (res.success && res.transactionId) {
        setPendingTxId(res.transactionId);
        setTitle('');
      } else if (res.requiresTopUp) {
        setIsTopUpOpen(true);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleAdminAction = async (approved: boolean) => {
    if (!pendingTxId || pendingTxId === 'free-post' || isSending) return;
    setIsSending(true);
    try {
      await resolvePost(approved, pendingTxId);
      setPendingTxId(null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <PlusSquare size={22} className="text-primary" />
          </div>
          Đăng bài mới
          <span className="text-base font-normal text-muted-foreground">(Seller)</span>
        </h1>
        <p className="text-muted-foreground">
          Mô phỏng quy trình đăng bài. Bài đầu tiên miễn phí, các bài sau sẽ tạm khóa 10 credit.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-card rounded-2xl shadow-lg border p-6 space-y-5">
        <form onSubmit={handlePreSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="post-title">Tiêu đề bất động sản</Label>
            <Input
              id="post-title"
              placeholder="VD: Bán căn hộ cao cấp tại Quận 1..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!!pendingTxId || isSending}
              className="text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-desc">Mô tả chi tiết</Label>
            <Textarea
              id="post-desc"
              placeholder="Nhập mô tả..."
              rows={4}
              disabled={!!pendingTxId || isSending}
            />
          </div>

          {/* Info banner */}
          <div className={`flex gap-3 rounded-xl border p-4 text-sm ${
            isFree
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
              : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
          }`}>
            <Info size={18} className="shrink-0 mt-0.5" />
            <div className="font-medium">
              {isFree ? (
                <>Trạng thái: <strong>Bài đăng đầu tiên (Miễn phí)</strong>. Bạn sẽ không bị trừ credit cho bài đăng này.</>
              ) : (
                <>Trạng thái: <strong>Bài đăng tính phí</strong>. Cần <strong>10 Credit</strong>. Số credit này sẽ bị tạm khóa và chỉ trừ khi bài được duyệt.</>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!!pendingTxId || !title.trim() || isSending}
          >
            {isSending ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Đang xử lý...</>
            ) : pendingTxId === 'free-post' ? (
              'Đang gửi...'
            ) : (
              'Gửi bài đăng duyệt'
            )}
          </Button>
        </form>
      </div>

      {/* Admin mock panel */}
      {pendingTxId && pendingTxId !== 'free-post' && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-amber-200 dark:border-amber-700">
            <ShieldCheck size={22} className="text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-200">Góc nhìn Admin (Mô phỏng)</h3>
              <p className="text-sm text-amber-700/70 dark:text-amber-300/70">
                Có 1 bài đăng đang chờ duyệt · ID: {pendingTxId}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="default"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleAdminAction(true)}
              disabled={isSending}
            >
              <CheckCircle size={16} className="mr-2" />
              Duyệt bài (Trừ 10 CR)
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleAdminAction(false)}
              disabled={isSending}
            >
              <XCircle size={16} className="mr-2" />
              Từ chối (Hoàn 10 CR)
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle size={18} />
              Xác nhận chi phí đăng bài
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Hệ thống sẽ <strong className="text-destructive">tạm khóa 10 credit</strong> từ ví của bạn để gửi bài đăng này lên chờ duyệt.
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Nếu được duyệt: 10 credit sẽ bị trừ chính thức.</li>
              <li>Nếu bị từ chối: 10 credit sẽ được hoàn lại ngay.</li>
            </ul>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3 font-medium text-foreground mt-2">
              <span>Số dư hiện tại: <strong>{balance} CR</strong></span>
              {balance < 10 && <span className="text-destructive text-xs">Không đủ Credit!</span>}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Hủy</Button>
            {balance >= 10 ? (
              <Button onClick={confirmSubmit}>Đồng ý & Đăng bài</Button>
            ) : (
              <Button variant="secondary" onClick={() => { setIsConfirmOpen(false); setIsTopUpOpen(true); }}>
                Nạp thêm Credit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </div>
  );
};