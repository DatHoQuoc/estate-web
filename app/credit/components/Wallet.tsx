import { useState } from "react"
import { CreditCard, Info, Sparkles, TrendingUp, Lock } from "lucide-react"
import { useCredit } from "@/components/credit/CreditContext"
import { TopUpModal } from "../components/TopUpModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export const Dashboard = () => {
  const { balance, lockedBalance, stats } = useCredit()
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const aiProgress = Math.min((stats.aiMessagesToday / 30) * 100, 100)
  const isAiLimitReached = stats.aiMessagesToday >= 30

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Wallet</h1>
        <p className="text-muted-foreground text-lg">
          Quản lý số dư và lịch sử giao dịch của bạn
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Số dư khả dụng</p>
                <p className="text-3xl font-black mt-1">{balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Credits</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard size={22} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang tạm khóa</p>
                <p className="text-3xl font-black mt-1">{lockedBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Credits (chờ duyệt)</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Lock size={22} className="text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI messages hôm nay</p>
                <p className="text-3xl font-black mt-1">{stats.aiMessagesToday}<span className="text-lg text-muted-foreground font-normal">/30</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Tin nhắn miễn phí</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Sparkles size={22} className="text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BALANCE CARD */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard size={20} className="text-primary" />
              Số dư khả dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold">{balance.toLocaleString()}</span>
              <span className="text-muted-foreground text-lg pb-1">Credits</span>
            </div>

            {lockedBalance > 0 && (
              <div className="flex items-center gap-2 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-200">
                <Info size={15} className="shrink-0" />
                <span>Đang tạm khóa <strong>{lockedBalance}</strong> credits cho bài đăng chờ duyệt</span>
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={() => setIsTopUpOpen(true)}
                className="w-full"
                size="lg"
              >
                <TrendingUp size={16} className="mr-2" />
                Mua thêm Credit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI USAGE CARD */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles size={20} className="text-violet-500" />
              AI Chat Usage
              {isAiLimitReached && (
                <Badge variant="destructive" className="ml-auto text-xs">Hết lượt</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-muted-foreground">Tin nhắn miễn phí hôm nay</span>
              <span className="text-2xl font-bold">
                {stats.aiMessagesToday}
                <span className="text-muted-foreground text-sm font-normal ml-1">/ 30</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <Progress
                value={aiProgress}
                className={`h-3 ${isAiLimitReached ? "[&>div]:bg-destructive" : "[&>div]:bg-violet-500"}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>30 tin nhắn / ngày</span>
              </div>
            </div>

            {isAiLimitReached ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                <Info size={15} className="shrink-0 mt-0.5" />
                <span>Bạn đã dùng hết lượt miễn phí. Mỗi tin nhắn tiếp theo sẽ bị trừ <strong>1 credit</strong>.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg bg-muted/50 px-3 py-2.5">
                <Info size={14} className="shrink-0" />
                <span>Reset vào lúc 00:00 GMT+7 mỗi ngày. Còn <strong>{30 - stats.aiMessagesToday}</strong> tin nhắn.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </div>
  )
}
