"use client";

import { Activity, Bot, MessageSquareText, ShieldCheck } from "lucide-react";
import { AdminSectionScaffold } from "@/components/admin/AdminSectionScaffold";
import { StatsCard } from "@/components/common/stats-card";

export default function AdminAiUsagePage() {
  return (
    <AdminSectionScaffold
      eyebrow="Administration"
      title="AI Usage Dashboard"
      description="Scaffold for tracking assistant adoption, prompt volume, guardrail events, and cost or quota monitoring across AI-enabled flows."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Assistant Sessions" value="Pending" icon={<Bot className="h-5 w-5" />} variant="default" />
        <StatsCard title="Prompt Volume" value="Pending" icon={<MessageSquareText className="h-5 w-5" />} variant="info" />
        <StatsCard title="Guardrail Events" value="Pending" icon={<ShieldCheck className="h-5 w-5" />} variant="warning" />
        <StatsCard title="Usage Health" value="Pending" icon={<Activity className="h-5 w-5" />} variant="success" />
      </div>

      <div className="mt-6 rounded-md border bg-card p-8 text-center">
        <h3 className="mb-2 text-lg font-medium text-foreground">AI usage scaffold ready</h3>
        <p className="text-muted-foreground">
          Add model usage series, per-feature breakdowns, and alerting thresholds here when the backend endpoints are available.
        </p>
      </div>
    </AdminSectionScaffold>
  );
}