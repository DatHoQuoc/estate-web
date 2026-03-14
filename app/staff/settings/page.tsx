"use client";

import { StaffSidebar } from "@/components/layout/staff-sidebar";

export default function StaffSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaffSidebar />
      <main className="ml-60 pt-6">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure your staff account preferences.
            </p>
          </div>
          
          <div className="rounded-md border p-8 text-center bg-card">
            <h3 className="text-lg font-medium text-foreground mb-2">Staff Settings Under Construction</h3>
            <p className="text-muted-foreground">
              This page will display preferences for notifications, display settings, and your personal details.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
