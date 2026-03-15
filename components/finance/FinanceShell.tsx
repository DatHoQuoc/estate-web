import { Outlet } from "react-router-dom";
import { FinanceSidebar } from "@/components/finance/FinanceSidebar";

export function FinanceShell() {
  return (
    <div className="min-h-screen bg-background">
      <FinanceSidebar />
      <div className="ml-60">
        <Outlet />
      </div>
    </div>
  );
}
