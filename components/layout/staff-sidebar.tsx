import { LayoutDashboard, ClipboardList, CheckSquare, BarChart3, Settings, Users, Wallet } from "lucide-react";
import { AppSidebar } from "@/components/common/app-sidebar";

export function StaffSidebar() {
  return (
    <AppSidebar
      items={[
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard />,
          path: "/staff",
        },
        {
          id: "review-queue",
          label: "Review Queue",
          icon: <ClipboardList />,
          path: "/staff/review",
        },
        {
          id: "my-reviews",
          label: "My Reviews",
          icon: <CheckSquare />,
          path: "/staff/my-reviews",
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: <BarChart3 />,
          path: "/staff/analytics",
        },
        {
          id: "sellers",
          label: "Sellers",
          icon: <Users />,
          path: "/staff/sellers",
        },
        {
          id: "wallet",
          label: "Wallet & Credits",
          icon: <Wallet />,
          path: "/credit",
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings />,
          path: "/staff/settings",
        },
      ]}
    />
  );
}
