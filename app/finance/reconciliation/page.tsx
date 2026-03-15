import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TopBar } from "@/components/shared/TopBar";
import { DataSourcePanel } from "@/components/finance/DataSourcePanel";
import { CrossCheckPanel } from "@/components/finance/CrossCheckPanel";
import { StatsCard } from "@/components/shared/StatsCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/hooks/use-toast";
import { CreditCard, Landmark, Server, Receipt, RefreshCw, Loader2 } from "lucide-react";
import { ReconciliationSummary } from "@/lib/finance-type";
import { getReconciliationSummary } from "@/lib/reconciliation-api";

gsap.registerPlugin(ScrollTrigger);

const MONTHS = [
  { value: "1",  label: "January"   }, { value: "2",  label: "February"  },
  { value: "3",  label: "March"     }, { value: "4",  label: "April"     },
  { value: "5",  label: "May"       }, { value: "6",  label: "June"      },
  { value: "7",  label: "July"      }, { value: "8",  label: "August"    },
  { value: "9",  label: "September" }, { value: "10", label: "October"   },
  { value: "11", label: "November"  }, { value: "12", label: "December"  },
];
const now   = new Date();
const YEARS = [now.getFullYear() - 1, now.getFullYear()].map(String);

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-lg" />)}
      </div>
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

export default function ReconciliationPage() {
  const [month,   setMonth]   = useState(String(now.getMonth() + 1));
  const [year,    setYear]    = useState(String(now.getFullYear()));
  const [data,    setData]    = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getReconciliationSummary(Number(month), Number(year));
      setData(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
      toast({ title: "Load Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  useEffect(() => {
    if (!data || !panelsRef.current) return;
    const panels = panelsRef.current.querySelectorAll("[data-animate]");
    panels.forEach((el) =>
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      })
    );
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [data]);

  return (
    <main className="flex flex-col h-full">
      <TopBar title="Financial Reconciliation" />

      <div className="flex-1 overflow-y-auto">
        {/* Period selector */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-2 border-b border-border bg-card/50">
          <span className="text-sm font-medium text-muted-foreground">Period:</span>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchSummary} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {/* States */}
        {loading && !data && <DashboardSkeleton />}

        {error && !data && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={fetchSummary}>Retry</Button>
          </div>
        )}

        {data && (
          <div ref={panelsRef} className="p-6 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-animate>
              <StatsCard title="Net System Credits"  value={`${(data.netSystemCredits / 1_000_000).toFixed(1)}M ₫`}     icon={CreditCard} trend="+8.2%" trendUp />
              <StatsCard title="Gateway Received"    value={`${(data.totalGatewayReceived / 1_000_000).toFixed(1)}M ₫`} icon={Landmark}   trend="+5.1%" trendUp />
              <StatsCard title="Platform Expenses"   value={`${(data.totalExpenses / 1_000).toFixed(0)}K ₫`}            icon={Server}     trend="+2.3%" trendUp={false} />
              <StatsCard
                title="Audit Issues"
                value={data.unmatchedCount + data.partialCount}
                icon={Receipt}
                trend={data.unmatchedCount > 0 ? `${data.unmatchedCount} unmatched` : "All matched"}
                trendUp={data.unmatchedCount === 0}
              />
            </div>

            {/* Data source panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div data-animate>
                <DataSourcePanel
                  title="System Credits" icon={CreditCard}
                  items={[
                    { label: "Credits Sold",     value: data.totalCreditSold },
                    { label: "Credits Used",      value: data.totalCreditUsed },
                    { label: "Credits Refunded",  value: data.totalRefunded   },
                  ]}
                  total={data.netSystemCredits}
                />
              </div>
              <div data-animate>
                <DataSourcePanel
                  title="Payment Gateway" icon={Landmark}
                  items={[
                    { label: "Bank Transfers", value: data.gatewayBankTransfers },
                    { label: "E-Wallets",       value: data.gatewayEWallets      },
                    { label: "Other Methods",   value: data.gatewayOther         },
                  ]}
                  total={data.totalGatewayReceived}
                />
              </div>
              <div data-animate>
                <DataSourcePanel
                  title="Platform Expenses" icon={Server}
                  items={[
                    { label: "Hosting",            value: data.expenseHosting            },
                    { label: "AI API Costs",        value: data.expenseAiApi              },
                    { label: "Payment Processing",  value: data.expensePaymentProcessing  },
                    { label: "Support",             value: data.expenseSupport            },
                  ]}
                  total={data.totalExpenses}
                />
              </div>
            </div>

            {/* Cross-check */}
            <div data-animate>
              <CrossCheckPanel data={data} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}