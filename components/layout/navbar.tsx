"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bell, ChevronDown, LogOut, MapPinHouse, Settings, Shield, User as UserIcon, Wallet, Search } from "lucide-react";
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
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavbarProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  fixed?: boolean;
}

export function Navbar({ notificationCount = 5, onNotificationClick, onProfileClick, fixed }: NavbarProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const onLogout = async () => {
    await logout();
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { balance } = useCredit();

  useEffect(() => {
    const isDiscoverRoute = location.pathname.startsWith("/discover");
    if (!isDiscoverRoute) return;

    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("q") || "");
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = searchQuery.trim();
    const params = new URLSearchParams();
    if (normalized) {
      params.set("q", normalized);
    }

    navigate(`/discover/map${params.toString() ? `?${params.toString()}` : ""}`);
  };

  let className = "z-50 shadow-xs bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-border/50";

  if (fixed) {
    className += " fixed top-0 left-0 w-screen h-16";
  }

  const navLinks = [
    { name: "Discover", href: "/discover" },
    { name: "Seller Dashboard", href: "/seller" },
    { name: "Staff Review", href: "/staff" },
  ];

  return (
    <header className={className}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6 mx-auto w-full">
        <Link to={user ? '/discover' : '/'} className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <MapPinHouse className="text-primary-foreground h-5 w-5" />
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">PropList Real Estate</span>
            <span className="text-[10px] text-muted-foreground font-medium hidden lg:block">Your trusty place for real estate listing</span>
          </div>
        </Link>

        {/* Mega Navigation Menu */}
        <div className="hidden lg:flex items-center mx-4">
          <NavigationMenu>
            <NavigationMenuList>

              {/* Buy Category */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-semibold hover:bg-muted/50 focus:bg-muted/50 data-[state=open]:bg-muted/50 data-[active]:bg-muted/50 rounded-full">
                  Buy
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex w-[800px] p-6 gap-8 rounded-xl bg-white shadow-xl dark:bg-zinc-950">
                    <div className="flex items-center justify-center flex-1 text-muted-foreground">
                      Buy directory placeholder
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Rent Category */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-semibold hover:bg-muted/50 focus:bg-muted/50 data-[state=open]:bg-muted/50 data-[active]:bg-muted/50 rounded-full">
                  Rent
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex w-[800px] p-0 rounded-xl bg-white shadow-xl dark:bg-zinc-950 overflow-hidden">
                    <div className="flex flex-col flex-1">
                      <div className="grid grid-cols-3 gap-6 p-6 pb-4">
                        {/* Col 1 */}
                        <div>
                          <h4 className="flex items-center font-bold text-sm mb-4 text-foreground hover:text-primary cursor-pointer transition-colors group">
                            HDB Directory <ChevronDown className="h-4 w-4 ml-1 -rotate-90 text-muted-foreground group-hover:text-primary transition-colors" />
                          </h4>
                          <ul className="space-y-3">
                            <li><NavigationMenuLink asChild><Link to="/discover?q=3+room+flats" className="text-sm text-muted-foreground hover:text-primary transition-colors block">3 Room Flats</Link></NavigationMenuLink></li>
                            <li><NavigationMenuLink asChild><Link to="/discover?q=2+room+flats" className="text-sm text-muted-foreground hover:text-primary transition-colors block">2 Room Flats</Link></NavigationMenuLink></li>
                            <li><NavigationMenuLink asChild><Link to="/discover?q=HDB+room+rentals" className="text-sm text-muted-foreground hover:text-primary transition-colors block">HDB Room Rentals</Link></NavigationMenuLink></li>
                          </ul>
                        </div>

                        {/* Col 2 */}
                        <div>
                          <h4 className="flex items-center font-bold text-sm mb-4 text-foreground hover:text-primary cursor-pointer transition-colors group">
                            Condo Directory <ChevronDown className="h-4 w-4 ml-1 -rotate-90 text-muted-foreground group-hover:text-primary transition-colors" />
                          </h4>
                          <ul className="space-y-3">
                            <li><NavigationMenuLink asChild><Link to="/discover?q=2+bedroom+condos" className="text-sm text-muted-foreground hover:text-primary transition-colors block">2 Bedroom Condos</Link></NavigationMenuLink></li>
                            <li><NavigationMenuLink asChild><Link to="/discover?q=1+bedroom+condos" className="text-sm text-muted-foreground hover:text-primary transition-colors block">1 Bedroom Condos</Link></NavigationMenuLink></li>
                            <li><NavigationMenuLink asChild><Link to="/discover?q=condo+room+rentals" className="text-sm text-muted-foreground hover:text-primary transition-colors block">Condo Room Rentals</Link></NavigationMenuLink></li>
                          </ul>
                        </div>

                        {/* Col 3 */}
                        <div>
                          <h4 className="flex items-center font-bold text-sm mb-4 text-foreground hover:text-primary cursor-pointer transition-colors group">
                            Landed <ChevronDown className="h-4 w-4 ml-1 -rotate-90 text-muted-foreground group-hover:text-primary transition-colors" />
                          </h4>
                          <ul className="space-y-3">
                            <li><NavigationMenuLink asChild><Link to="/discover?q=bungalows" className="text-sm text-muted-foreground hover:text-primary transition-colors block">Bungalows</Link></NavigationMenuLink></li>
                            <li><NavigationMenuLink asChild><Link to="/discover?q=terraced+houses" className="text-sm text-muted-foreground hover:text-primary transition-colors block">Terraced Houses</Link></NavigationMenuLink></li>
                            <li><NavigationMenuLink asChild><Link to="/discover?q=landed+house+room+rentals" className="text-sm text-muted-foreground hover:text-primary transition-colors block">Landed House Room Rentals</Link></NavigationMenuLink></li>
                          </ul>
                        </div>
                      </div>

                      {/* Bottom Strip */}
                      <div className="border-t border-border px-6 py-4 flex items-center group cursor-pointer hover:bg-muted/10 transition-colors mt-auto" onClick={() => navigate("/discover")}>
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">View All Rental Properties</span>
                        <ChevronDown className="h-4 w-4 ml-1 -rotate-90 text-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Resource Block */}
                    <div className="w-[280px] shrink-0 bg-slate-50 dark:bg-zinc-900 border-l border-border p-6 flex flex-col">
                      <h5 className="font-bold text-sm mb-4 text-left">Rental Resources</h5>
                      <img
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=260&auto=format&fit=crop"
                        alt="Rental Resources"
                        className="w-full h-32 object-cover mb-4"
                      />
                      <NavigationMenuLink asChild>
                        <Link to="/discover/assistant" className="text-sm text-foreground hover:text-primary transition-colors mt-auto">Find an Agent</Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Sell Category */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-semibold hover:bg-muted/50 focus:bg-muted/50 data-[state=open]:bg-muted/50 data-[active]:bg-muted/50 rounded-full" onClick={() => navigate('/seller')}>
                  Sell
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex w-[400px] p-6 gap-8 rounded-xl bg-white shadow-xl dark:bg-zinc-950">
                    <div className="flex items-center justify-center flex-1 text-muted-foreground">
                      Sell directory placeholder
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* New Projects Category */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-semibold hover:bg-muted/50 focus:bg-muted/50 data-[state=open]:bg-muted/50 data-[active]:bg-muted/50 rounded-full">
                  New Projects
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex w-[400px] p-6 gap-8 rounded-xl bg-white shadow-xl dark:bg-zinc-950">
                    <div className="flex items-center justify-center flex-1 text-muted-foreground">
                      New Projects placeholder
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Guides Category */}
              <NavigationMenuItem>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-sm font-semibold hover:bg-muted/50 focus:bg-muted/50 rounded-full cursor-pointer")}>
                  Guides
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* More Category */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-semibold hover:bg-muted/50 focus:bg-muted/50 data-[state=open]:bg-muted/50 data-[active]:bg-muted/50 rounded-full">
                  More
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex w-[400px] p-6 gap-8 rounded-xl bg-white shadow-xl dark:bg-zinc-950">
                    <div className="flex flex-col flex-1 gap-2">
                      <Link to="/staff" className="text-sm text-foreground hover:text-primary">Staff Reviews</Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Search Bar */}
        <form
          className="hidden md:flex flex-1 items-center max-w-md mx-4 relative group"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search properties, agents, or locations..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="flex h-10 w-full rounded-full border border-input bg-muted/40 px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10"
          />
        </form>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user ? (
            <><Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 shadow-sm rounded-full px-4 font-medium transition-all"
              onClick={() => navigate("/profile/settings?tab=wallet")}
            >
              <Wallet className="h-4 w-4" />
              <span>{balance.toLocaleString()}</span>
            </Button><Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-full h-10 w-10 transition-colors" onClick={onNotificationClick}>
                <Bell className="h-5 w-5 text-muted-foreground" />
                {notificationCount > 0 && (
                  <span className="absolute max-h-5 min-w-5 -top-0.5 -right-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background shadow-sm">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button><DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 h-auto rounded-full hover:bg-muted/50 transition-colors">
                    <Avatar className="h-9 w-9 border border-border shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.name
                          ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
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
              </DropdownMenu></>
          ) : (
            <Button onClick={() => navigate("/auth/login")}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
}
