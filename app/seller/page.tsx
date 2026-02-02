"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Home, CheckCircle, Clock, XCircle, Plus, Eye, Edit, Trash2, Upload, RotateCcw } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { SellerSidebar } from "@/components/layout/seller-sidebar"
import { StatsCard } from "@/components/common/stats-card"
import { SearchBar } from "@/components/common/search-bar"
import { FilterDropdown } from "@/components/common/filter-dropdown"
import { Pagination } from "@/components/common/pagination"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockUser } from "@/lib/mock-data"
import { listSellerListings, publishListing, unpublishListing } from "@/lib/api-client"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "pending_staff_review", label: "Pending Review" },
  { value: "ai_rejected", label: "AI Rejected" },
  { value: "draft", label: "Draft" },
]

function SellerDashboardContent() {
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = () => {
    let isMounted = true
    setLoading(true)
    listSellerListings()
      .then((data) => {
        if (!isMounted) return
        setListings(data)
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

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch = listing.title
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || listing.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [listings, search, statusFilter])

  const listingStats = useMemo(() => {
    const total = listings.length
    const published = listings.filter((l) => l.status === "published").length
    const pending = listings.filter((l) => l.status?.includes("pending")).length
    const rejected = listings.filter(
      (l) => l.status?.includes("rejected") || l.status === "ai_rejected"
    ).length
    return { total, published, pending, rejected }
  }, [listings])

  const handleView = (id: string) => {
    navigate(`/seller/listings/${id}`)
  }

  const handleEdit = (id: string) => {
    navigate(`/seller/listings/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    console.log("Delete listing:", id)
  }

  const handlePublish = async (id: string) => {
    setActionLoading(id)
    try {
      await publishListing(id)
      await loadListings()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnpublish = async (id: string) => {
    setActionLoading(id)
    try {
      await unpublishListing(id)
      await loadListings()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      published: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Published" },
      pending_staff_review: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending Review" },
      draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
      ai_rejected: { bg: "bg-red-100", text: "text-red-700", label: "AI Rejected" },
      staff_rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
    }

    const variant = variants[status] || variants.draft
    return (
      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variant.bg, variant.text)}>
        {variant.label}
      </span>
    )
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
            <Button onClick={() => navigate("/seller/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Listing
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Listings"
              value={listingStats.total}
              icon={<Home className="h-5 w-5" />}
              trend={{ value: 0, direction: "up" }}
            />
            <StatsCard
              title="Published"
              value={listingStats.published}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Pending Review"
              value={listingStats.pending}
              icon={<Clock className="h-5 w-5" />}
              variant="warning"
            />
            <StatsCard
              title="Rejected"
              value={listingStats.rejected}
              icon={<XCircle className="h-5 w-5" />}
              variant="danger"
            />
          </div>

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

          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading listings...
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No listings found
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => {
                    const isLoading = actionLoading === listing.id
                    return (
                      <tr key={listing.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={listing.images.find((img) => img.isCover)?.url || listing.images[0]?.url}
                              alt={listing.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {listing.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {listing.location.district}, {listing.location.city}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          ${listing.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(listing.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isLoading}>
                                {isLoading ? "..." : "Actions"}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(listing.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>

                              {listing.status.toLowerCase() === "draft" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(listing.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePublish(listing.id)}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Submit for Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(listing.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}

                              {listing.status === "pending_staff_review" && (
                                <DropdownMenuItem onClick={() => handleUnpublish(listing.id)}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Withdraw
                                </DropdownMenuItem>
                              )}

                              {listing.status.toLowerCase() === "draft" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUnpublish(listing.id)}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </DropdownMenuItem>
                                  {/* listing.mediaType === "photos_and_tour" &&  */}
                                  {(
                                    <DropdownMenuItem onClick={() => navigate(`/seller/listings/${listing.id}/tour/edit`)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Tour
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}

                              {(listing.status === "ai_rejected" || listing.status === "staff_rejected") && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(listing.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit & Resubmit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(listing.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mt-4 text-sm text-destructive">
              Failed to load listings: {error}
            </div>
          )}

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