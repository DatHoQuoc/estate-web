"use client";

import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { User, Bell, Shield, Smartphone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellerSettingsPage() {
  const sections = [
    { title: "Profile Information", icon: <User className="h-5 w-5" />, desc: "Update your personal details and public profile." },
    { title: "Notifications", icon: <Bell className="h-5 w-5" />, desc: "Manage how you receive alerts about your listings." },
    { title: "Security", icon: <Shield className="h-5 w-5" />, desc: "Adjust your password and account security settings." },
    { title: "Connected Devices", icon: <Smartphone className="h-5 w-5" />, desc: "View and manage devices logged into your account." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />
      <main className="ml-60 pt-6">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Seller Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configuration and preferences for your seller account.
            </p>
          </div>

          <div className="max-w-3xl space-y-4">
            {sections.map((section, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}

            <div className="pt-8 border-t">
              <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
              <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Delete Account</h4>
                  <p className="text-xs text-muted-foreground">Permanently remove your account and all listings.</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
