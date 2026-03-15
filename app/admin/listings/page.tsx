"use client";

import { AlertTriangle, ListChecks, ScanSearch, Shield } from "lucide-react";
import { AdminSectionScaffold } from "@/components/admin/AdminSectionScaffold";
import { StatsCard } from "@/components/common/stats-card";

export default function AdminListingsPage() {
  return (
    <AdminSectionScaffold
      eyebrow="Administration"
      title="Listings Control"
      description="Scaffold for central listing governance, moderation escalation, bulk actions, and quality controls across the marketplace."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Pending Reviews" value="Pending" icon={<ListChecks className="h-5 w-5" />} variant="warning" />
        <StatsCard title="Flagged Listings" value="Pending" icon={<AlertTriangle className="h-5 w-5" />} variant="danger" />
        <StatsCard title="Compliance Checks" value="Pending" icon={<Shield className="h-5 w-5" />} variant="success" />
        <StatsCard title="Bulk Actions" value="Pending" icon={<ScanSearch className="h-5 w-5" />} variant="info" />
      </div>

      <div className="mt-6 rounded-md border bg-card p-8 text-center">
        <h3 className="mb-2 text-lg font-medium text-foreground">Listings control scaffold ready</h3>
        <p className="text-muted-foreground">
          Use this page for bulk moderation queues, listing visibility controls, and escalation tooling.
        </p>
      </div>
    </AdminSectionScaffold>
  );
}