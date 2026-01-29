"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Home,
  Plus,
  BarChart3,
  Settings,
  MessageSquare,
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
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/seller/settings",
  },
]

export function SellerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-card border-r border-border">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== "/seller" && pathname.startsWith(item.path))
          
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
