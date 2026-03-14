"use client";

import { StaffSidebar } from "@/components/layout/staff-sidebar";

export default function StaffSellersPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaffSidebar />
      <main className="ml-60 pt-6">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Sellers</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage seller accounts and profiles.
            </p>
          </div>
          
          <div className="rounded-md border p-8 text-center bg-card">
            <h3 className="text-lg font-medium text-foreground mb-2">Sellers Data Under Construction</h3>
            <p className="text-muted-foreground">
              This page will allow you to view and moderate seller activities on the platform.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
