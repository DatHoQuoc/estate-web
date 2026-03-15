"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, Users, UserX } from "lucide-react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { StatsCard } from "@/components/common/stats-card";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { authClient } from "../../../src/lib/auth-client";
import type { UserStatsResponseDto } from "../../../src/lib/auth-types";

export default function AdminUsersPage() {
  const [stats, setStats] = useState<UserStatsResponseDto>({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });

  const loadStats = async () => {
    try {
      const data = await authClient.getUserStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch user stats", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="ml-60 pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider text-primary">Administration</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">User Management</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Manage system access, monitor account status, and prepare operational dashboards.
              </p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Users"
              value={stats.total}
              icon={<Users className="h-5 w-5" />}
              variant="default"
            />
            <StatsCard
              title="Active"
              value={stats.active}
              icon={<UserCheck className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Inactive"
              value={stats.inactive}
              icon={<Users className="h-5 w-5" />}
              variant="warning"
            />
            <StatsCard
              title="Suspended"
              value={stats.suspended}
              icon={<UserX className="h-5 w-5" />}
              variant="danger"
            />
          </div>

          <div className="space-y-6">
            <UserManagementTable onUsersChanged={loadStats} />
          </div>
        </div>
      </main>
    </div>
  );
}
