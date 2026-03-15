import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

interface AdminSectionScaffoldProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminSectionScaffold({
  eyebrow,
  title,
  description,
  children,
}: AdminSectionScaffoldProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="ml-60 pt-6">
        <div className="mx-auto max-w-7xl p-6">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}