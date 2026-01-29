"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  BarChart3,
  Settings,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/staff",
  },
  {
    id: "review-queue",
    label: "Review Queue",
    icon: <ClipboardList className="h-5 w-5" />,
    path: "/staff/review",
  },
  {
    id: "my-reviews",
    label: "My Reviews",
    icon: <CheckSquare className="h-5 w-5" />,
    path: "/staff/my-reviews",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    path: "/staff/analytics",
  },
  {
    id: "sellers",
    label: "Sellers",
    icon: <Users className="h-5 w-5" />,
    path: "/staff/sellers",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/staff/settings",
  },
]

export function StaffSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-card border-r border-border">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== "/staff" && pathname.startsWith(item.path))
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
