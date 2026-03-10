import { useState } from 'react';
import { useCredit } from '@/components/credit/CreditContext';
import { Bot, Send, AlertCircle, Loader2 } from 'lucide-react';
import { TopUpModal } from '../components/TopUpModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const SimulateAiChat = () => {
  const { stats, useAiChat } = useCredit();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [errorObj, setErrorObj] = useState<{message: string, requiresTopUp: boolean} | null>(null);
  const [isSending, setIsSending] = useState(false);

  const isAiLimitReached = stats.aiMessagesToday >= 30;
  const remaining = 30 - stats.aiMessagesToday;

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const userMsg = input;
    setIsSending(true);

    try {
      const res = await useAiChat();

      if (!res.success) {
        setErrorObj({ message: res.message, requiresTopUp: res.requiresTopUp || false });
        return;
      }

      setErrorObj(null);
      setMessages(prev => [...prev,
        { role: 'user', text: userMsg },
        { role: 'ai', text: `Tôi là AI trợ lý. Phản hồi cho: "${userMsg}" (Đã dùng ${stats.aiMessagesToday + 1}/30 tin nhắn miễn phí trong ngày)` }
      ]);
      setInput('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot size={22} className="text-primary" />
          </div>
          AI Tìm Nhà
        </h1>
        <p className="text-muted-foreground">
          Chat với AI để tìm kiếm bất động sản.{' '}
          {isAiLimitReached ? (
            <span className="text-destructive font-semibold">
              Bạn đã dùng hết 30 tin nhắn miễn phí hôm nay. (1 Credit / tin nhắn)
            </span>
          ) : (
            <span className="font-semibold text-primary">
              Bạn còn {remaining} tin nhắn miễn phí hôm nay.
            </span>
          )}
        </p>
      </div>

      {/* Chat container */}
      <div className="bg-card rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[600px]">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-muted/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
              <Bot size={56} className="mb-4" />
              <p className="text-lg font-medium">Bắt đầu trò chuyện với AI</p>
              <p className="text-sm mt-1">Hỏi về bất động sản bạn muốn tìm</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-3 items-start", msg.role === 'user' && "flex-row-reverse")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border text-muted-foreground"
                )}>
                  {msg.role === 'user' ? 'U' : <Bot size={16} />}
                </div>
                {/* Bubble */}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-background border rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Error alert */}
        {errorObj && (
          <div className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Lỗi gửi tin nhắn</p>
              <p>{errorObj.message}</p>
            </div>
            {errorObj.requiresTopUp && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setIsTopUpOpen(true)}
              >
                Nạp ngay
              </Button>
            )}
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-card border-t flex gap-3">
          <Input
            placeholder="Bạn muốn tìm nhà như thế nào...?"
            className="flex-1 rounded-full px-5"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            size="icon"
            className="rounded-full w-10 h-10 shrink-0"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </div>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </div>
  );
};
