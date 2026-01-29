"use client"

import { useState } from "react"
import { Clock, ArrowUpDown, Eye, UserCheck } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PriorityBadge } from "@/components/common/status-badge"
import { cn } from "@/lib/utils"
import type { ReviewListing } from "@/lib/types"

interface ReviewQueueTableProps {
  listings: ReviewListing[]
  isLoading?: boolean
  currentUserId?: string
  onClaim?: (listingId: string) => void
  onView?: (listingId: string) => void
}

type SortField = "priority" | "waitTime" | "submittedAt"
type SortOrder = "asc" | "desc"

const priorityOrder = { high: 3, medium: 2, low: 1 }

export function ReviewQueueTable({
  listings,
  isLoading = false,
  currentUserId,
  onClaim,
  onView,
}: ReviewQueueTableProps) {
  const [sortField, setSortField] = useState<SortField>("priority")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const sortedListings = [...listings].sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortField) {
      case "priority":
        aValue = priorityOrder[a.priority]
        bValue = priorityOrder[b.priority]
        break
      case "waitTime":
        aValue = a.waitTime
        bValue = b.waitTime
        break
      case "submittedAt":
        aValue = new Date(a.submittedAt).getTime()
        bValue = new Date(b.submittedAt).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatWaitTime = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`
    }
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Property</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Wait Time</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-16 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 text-center">
        <p className="text-muted-foreground">No listings pending review</p>
        <p className="text-sm text-muted-foreground mt-1">
          The review queue is empty
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[300px]">Property</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-medium"
                onClick={() => handleSort("priority")}
              >
                Priority
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-medium"
                onClick={() => handleSort("waitTime")}
              >
                Wait Time
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedListings.map((listing) => {
            const isAssignedToMe = listing.assignedTo === currentUserId
            const isAssigned = !!listing.assignedTo

            return (
              <TableRow key={listing.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      {listing.thumbnailUrl ? (
                        <img
                          src={listing.thumbnailUrl || "/placeholder.svg"}
                          alt={listing.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate max-w-[200px]">
                        {listing.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.propertyType} - {formatPrice(listing.price)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{listing.seller.name}</p>
                    <span className="text-xs text-muted-foreground capitalize">
                      {listing.seller.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={listing.priority} />
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm",
                      listing.waitTime > 24 && "text-amber-600 font-medium",
                      listing.waitTime > 48 && "text-red-600 font-medium"
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    {formatWaitTime(listing.waitTime)}
                  </div>
                </TableCell>
                <TableCell>
                  {isAssigned ? (
                    <span
                      className={cn(
                        "text-sm",
                        isAssignedToMe && "text-primary font-medium"
                      )}
                    >
                      {isAssignedToMe ? "You" : "Other Staff"}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView?.(listing.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {!isAssigned && (
                      <Button
                        size="sm"
                        onClick={() => onClaim?.(listing.id)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Claim
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
