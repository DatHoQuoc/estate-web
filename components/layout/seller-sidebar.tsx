import { LayoutDashboard, Home, Plus, BarChart3, Settings, MessageSquare, Wallet } from "lucide-react";
import { AppSidebar } from "../common/app-sidebar";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/seller",
  },
  {
    id: "listings",
    label: "My Listings",
    icon: <Home className="h-5 w-5" />,
    path: "/seller/listings",
  },
  {
    id: "create",
    label: "Create Listing",
    icon: <Plus className="h-5 w-5" />,
    path: "/seller/create",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    path: "/seller/analytics",
  },
  {
    id: "messages",
    label: "Messages",
    icon: <MessageSquare className="h-5 w-5" />,
    path: "/seller/messages",
  },
  {
    id: "wallet",
    label: "Wallet & Credits",
    icon: <Wallet className="h-5 w-5" />,
    path: "/credit",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/seller/settings",
  },
];

export function SellerSidebar() {
  return <AppSidebar items={menuItems} />;
}
