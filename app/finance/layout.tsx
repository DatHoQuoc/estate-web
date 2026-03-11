"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/common/app-sidebar";

export default function FinanceLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* sidebar */}
            <AppSidebar role="finance" />

            {/* content */}
            <main className="flex-1 p-6 bg-muted/40">
                {children}
            </main>
        </div>
    )
}