"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Home, CheckCircle, Clock, XCircle, Plus } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { SellerSidebar } from "@/components/layout/seller-sidebar"
import { StatsCard } from "@/components/common/stats-card"
import { SearchBar } from "@/components/common/search-bar"
import { FilterDropdown } from "@/components/common/filter-dropdown"
import { Pagination } from "@/components/common/pagination"
import { ListingsTable } from "@/components/seller/listings-table"
import { Button } from "@/components/ui/button"
import { mockUser, mockListings, mockListingStats } from "@/lib/mock-data"

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "pending_staff_review", label: "Pending Review" },
  { value: "ai_rejected", label: "AI Rejected" },
  { value: "draft", label: "Draft" },
]

function SellerDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredListings = mockListings.filter((listing) => {
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || listing.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleView = (id: string) => {
    router.push(`/seller/listings/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/seller/listings/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    console.log("Delete listing:", id)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} notificationCount={3} />
      <SellerSidebar />

      <main className="ml-60 pt-16">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and track all your property listings
              </p>
            </div>
            <Button onClick={() => router.push("/seller/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Listing
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Listings"
              value={mockListingStats.total}
              icon={<Home className="h-5 w-5" />}
              trend={{ value: 12, direction: "up" }}
            />
            <StatsCard
              title="Published"
              value={mockListingStats.published}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Pending Review"
              value={mockListingStats.pending}
              icon={<Clock className="h-5 w-5" />}
              variant="warning"
            />
            <StatsCard
              title="Rejected"
              value={mockListingStats.rejected}
              icon={<XCircle className="h-5 w-5" />}
              variant="danger"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <SearchBar
              placeholder="Search listings..."
              value={search}
              onChange={setSearch}
            />
            <FilterDropdown
              options={statusFilterOptions}
              selected={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
            />
          </div>

          {/* Listings Table */}
          <ListingsTable
            listings={filteredListings}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SellerDashboardContent />
    </Suspense>
  )
}
