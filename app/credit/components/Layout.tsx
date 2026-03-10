import { ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { useCredit } from "@/components/credit/CreditContext";
import { Wallet, History, MessageSquare, PlusSquare, Menu, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/credit", label: "Dashboard & Wallet", icon: Wallet, end: true },
  { to: "/credit/history", label: "Transaction History", icon: History },
];

const simulateItems = [
  { to: "/credit/simulate/chat", label: "Simulate AI Chat", icon: MessageSquare },
  { to: "/credit/simulate/post", label: "Simulate New Post", icon: PlusSquare },
];

const NavItem = ({ to, label, icon: Icon, end }: { to: string; label: string; icon: any; end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )
    }
  >
    <Icon size={17} />
    {label}
  </NavLink>
);

const SimulateNavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-violet-600 text-white shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )
    }
  >
    <Icon size={17} />
    {label}
  </NavLink>
);

const SidebarContent = ({ balance }: { balance: number }) => (
  <div className="flex flex-col h-full py-4 px-3">
    {/* Logo */}
    <div className="px-3 mb-6">
      <h2 className="text-xl font-extrabold tracking-tight text-primary flex items-center gap-2">
        <CreditCard size={22} />
        EstateVibe
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">Credit System</p>
    </div>

    {/* Main nav */}
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>

    {/* Divider */}
    <div className="my-4 px-3">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Simulate</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>

    {/* Simulate nav */}
    <nav className="space-y-1">
      {simulateItems.map((item) => (
        <SimulateNavItem key={item.to} {...item} />
      ))}
    </nav>

    {/* Balance widget */}
    <div className="mt-auto pt-4">
      <div className="rounded-xl border bg-primary/5 p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Số dư hiện tại</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-primary">{balance.toLocaleString()}</span>
          <span className="text-sm font-medium text-muted-foreground">Credits</span>
        </div>
      </div>
    </div>
  </div>
);

export const Layout = ({ children }: { children: ReactNode }) => {
  const { balance } = useCredit();

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r bg-background fixed inset-y-0 left-0 z-10">
        <SidebarContent balance={balance} />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-background border-b flex items-center justify-between px-4 h-14">
        <h2 className="font-extrabold text-primary flex items-center gap-2">
          <CreditCard size={18} />
          EstateVibe
        </h2>
        <Button variant="ghost" size="icon">
          <Menu size={20} />
        </Button>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-72 flex flex-col">
        <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
