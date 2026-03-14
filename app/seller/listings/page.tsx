"use client";

import { SellerSidebar } from "@/components/layout/seller-sidebar";
import SellerDashboardPage from "@app/seller/page";

export default function SellerListingsPage() {
  // Currently, the My Listings functionality is in /seller/page.tsx
  // This page provides a dedicated route for it.
  return <SellerDashboardPage />;
}
