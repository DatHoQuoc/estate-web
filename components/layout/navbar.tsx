"use client";

import { Bell, ChevronDown, LogOut, MapPinHouse, Settings, Shield, User as UserIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { useCredit } from "@/components/credit/CreditContext";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthContext";

interface NavbarProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  fixed?: boolean;
}

export function Navbar({ notificationCount = 0, onNotificationClick, onProfileClick, fixed }: NavbarProps) {
  const { user, logout } = useAuth();
  
  const onLogout = async () => {
    await logout();
  };
  const navigate = useNavigate();
  const { balance } = useCredit();

  let className = "z-50 shadow-xs"

  if (fixed) {
    className += " fixed top-0 left-0 w-screen";
  }

  return (
    <header className={className}>
      <div className="flex items-center justify-between h-full p-2">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-inner hover:scale-105 transition-transform">
            <MapPinHouse className="text-primary-foreground h-6 w-6" />
          </div>
          <div className="flex justify-center flex-col">
            <span className="font-bold text-lg text-foreground tracking-tight">PropList Real Estate</span>
            <span className="text-xs text-muted-foreground font-medium">Your trusty place for real estate listing</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          <Button 
            variant="outline" 
            className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 shadow-sm rounded-full px-4 font-medium transition-all"
            onClick={() => navigate("/profile/settings?tab=wallet")}
          >
            <Wallet className="h-4 w-4" />
            <span>{balance.toLocaleString()}</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-full h-10 w-10 transition-colors" onClick={onNotificationClick}>
            <Bell className="h-5 w-5 text-muted-foreground" />
            {notificationCount > 0 && (
              <span className="absolute max-h-5 min-w-5 -top-0.5 -right-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background shadow-sm">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-auto rounded-full hover:bg-muted/50 transition-colors">
                <Avatar className="h-9 w-9 border border-border shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user.name
                      ? user.name.split(" ").map((n) => n[0]).join("").substring(0,2).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start mr-1">
                  <span className="text-sm font-semibold leading-none mb-1">{user.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">{user.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-xl border-border/50 backdrop-blur-xl bg-white/95 dark:bg-zinc-950/95 overflow-hidden p-2">
              <div className="px-2 py-2 mb-1">
                <p className="text-sm font-bold">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={() => navigate("/profile/settings?tab=wallet")} className="rounded-lg my-0.5 cursor-pointer font-medium focus:bg-emerald-50 focus:text-emerald-700 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400">
                <Wallet className="mr-2 h-4 w-4" />
                Wallet & Credits
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile/settings")} className="rounded-lg my-0.5 cursor-pointer font-medium focus:bg-primary/10 focus:text-primary">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile/settings")} className="rounded-lg my-0.5 cursor-pointer font-medium focus:bg-primary/10 focus:text-primary">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin/users")} className="rounded-lg my-0.5 cursor-pointer font-medium text-primary focus:bg-primary/10">
                  <Shield className="mr-2 h-4 w-4" />
                  System Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={onLogout} className="rounded-lg my-0.5 cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth/login")}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
}
