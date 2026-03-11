import React from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
      <Navbar fixed />
      <div className="flex-1 mt-16 flex flex-col">
        <Breadcrumbs />
        {children}
      </div>
    </div>
  );
}
