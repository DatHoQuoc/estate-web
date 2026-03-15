import { AppSidebar } from "@/components/common/app-sidebar";
import { FINANCE_ROUTES } from "@/lib/finance-routes";
import { Landmark, ArrowLeftRight, Receipt } from "lucide-react";

const financeNavItems = [
  {
    id: "reconciliation",
    label: "Reconciliation",
    icon: <Landmark className="h-5 w-5" />,
    path: FINANCE_ROUTES.reconciliation,
  },
  {
    id: "audit",
    label: "Transaction Audit",
    icon: <ArrowLeftRight className="h-5 w-5" />,
    path: FINANCE_ROUTES.audit,
  },
  {
    id: "reports",
    label: "Monthly Reports",
    icon: <Receipt className="h-5 w-5" />,
    path: FINANCE_ROUTES.reports,
  },
];

export function FinanceSidebar() {
  return <AppSidebar items={financeNavItems} />;
}
