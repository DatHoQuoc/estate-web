import { Bot, BarChart3, LayoutDashboard, ListChecks, Users } from "lucide-react";
import { AppSidebar } from "@/components/common/app-sidebar";

const menuItems = [
    {
        id: "overview",
        label: "Admin Home",
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: "/admin",
    },
    {
        id: "users",
        label: "Users",
        icon: <Users className="h-5 w-5" />,
        path: "/admin/users",
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: <BarChart3 className="h-5 w-5" />,
        path: "/admin/analytics",
    },
    {
        id: "listings",
        label: "Listings Control",
        icon: <ListChecks className="h-5 w-5" />,
        path: "/admin/listings",
    },
    {
        id: "ai-usage",
        label: "AI Usage",
        icon: <Bot className="h-5 w-5" />,
        path: "/admin/ai-usage",
    },

];

export function AdminSidebar() {
    return <AppSidebar items={menuItems} />;
}