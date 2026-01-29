import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Seller Dashboard - PropList",
  description: "Manage your property listings",
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
