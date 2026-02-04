"use client"

import { Suspense, useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ClipboardList, UserCheck, CheckCircle, Timer } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { StaffSidebar } from "@/components/layout/staff-sidebar"
import { StatsCard } from "@/components/common/stats-card"
import { SearchBar } from "@/components/common/search-bar"
import { FilterDropdown } from "@/components/common/filter-dropdown"
import { Pagination } from "@/components/common/pagination"
import { ReviewQueueTable } from "@/components/staff/review-queue-table"
import { mockStaffUser, mockReviewQueue, mockStaffStats } from "@/lib/mock-data"
import { listSellerListings } from "@/lib/api-client"
import type { Listing, MergedListing } from "@/lib/types"
const priorityFilterOptions = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "unassigned", label: "Unassigned" },
  { value: "assigned", label: "Assigned to Me" },
]

function StaffDashboardContent() {
  const navigate = useNavigate()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<MergedListing[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = () => {
    let isMounted = true
    setLoading(true)
    listSellerListings()
      .then((data) => {
        if (!isMounted) return

        // Merge real API data with mock data
        const mergedListings = data.map((apiListing, index) => {
          const mockListing = mockReviewQueue[index] || mockReviewQueue[0]
         
          return {
            ...mockListing, // All mock attributes
            id: apiListing.id, // Override with real API data
            title: apiListing.title,
            thumbnailUrl: apiListing.featuredImageUrl,
          }
        })

        setListings(mergedListings)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        if (isMounted) setError(err.message || "Failed to load listings")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesPriority =
      priorityFilter === "all" || listing.priority === priorityFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unassigned" && !listing.assignedTo) ||
      (statusFilter === "assigned" && listing.assignedTo === mockStaffUser.id)
    return matchesSearch && matchesPriority && matchesStatus
  })



  const handleClaim = (listingId: string) => {
    navigate(`/staff/review/${listingId}`)
  }

  const handleView = (listingId: string) => {
    navigate(`/staff/review/${listingId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockStaffUser} notificationCount={5} />
      <StaffSidebar />

      <main className="ml-60 pt-16">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Review and approve pending property listings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Queue"
              value={mockStaffStats.totalQueue}
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <StatsCard
              title="Assigned to Me"
              value={mockStaffStats.assignedToMe}
              icon={<UserCheck className="h-5 w-5" />}
              variant="info"
            />
            <StatsCard
              title="Reviewed Today"
              value={mockStaffStats.reviewedToday}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Avg Review Time"
              value={mockStaffStats.avgReviewTime}
              icon={<Timer className="h-5 w-5" />}
              variant="warning"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <SearchBar
              placeholder="Search listings..."
              value={search}
              onChange={setSearch}
            />
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Priority"
                options={priorityFilterOptions}
                selected={priorityFilter}
                onChange={setPriorityFilter}
              />
              <FilterDropdown
                label="Status"
                options={statusFilterOptions}
                selected={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </div>

          {/* Review Queue Table */}
          <ReviewQueueTable
            listings={filteredListings}
            currentUserId={mockStaffUser.id}
            onClaim={handleClaim}
            onView={handleView}
          />

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={3}
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

export default function StaffDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StaffDashboardContent />
    </Suspense>
  )
}
