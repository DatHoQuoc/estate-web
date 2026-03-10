import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { Users, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage system access, verify accounts, and assign administrative roles.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Quick Stats</span>
              <div className="flex gap-4">
                <div className="text-right border-r border-border/50 pr-4">
                  <p className="text-xl font-bold">128</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Users</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">12</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Active Sellers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <UserManagementTable />
        </div>
      </div>
    </div>
  );
}
