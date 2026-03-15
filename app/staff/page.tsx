"use client";

import { Suspense, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ClipboardList, UserCheck, CheckCircle, Timer } from "lucide-react";
import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { StatsCard } from "@/components/common/stats-card";
import { SearchBar } from "@/components/common/search-bar";
import { FilterDropdown } from "@/components/common/filter-dropdown";
import { Pagination } from "@/components/common/pagination";
import { ReviewQueueTable } from "@/components/staff/review-queue-table";
import {
  getPendingReviewListings,
} from "@/lib/api-client";
import type { Listing, MergedListing } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthContext";
import { authClient } from "../../src/lib/auth-client";

const priorityFilterOptions = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "unassigned", label: "Unassigned" },
  { value: "assigned", label: "Assigned to Me" },
  { value: "PUBLISHED", label: "Published" },
];


function StaffDashboardContent() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MergedListing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = () => {
    let isMounted = true;
    setLoading(true);
    getPendingReviewListings()
      .then(async (data) => {
        if (!isMounted) return;

        const sellerProfiles = new Map<string, { username: string; role: string }>();

        const sellerIds = Array.from(
          new Set(
            data
              .map((listing) => listing.sellerId || listing.seller.id)
              .filter(Boolean)
          )
        ) as string[];

        await Promise.all(
          sellerIds.map(async (sellerId) => {
            try {
              const profile = await authClient.getPublicProfile(sellerId);
              const composedName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
              const username = profile.display_name || composedName || profile.email;
              sellerProfiles.set(sellerId, { username, role: "seller" });
            } catch (profileError) {
              console.warn(`Failed to fetch public profile for seller ${sellerId}`, profileError);
            }
          })
        );

        const mergedListings: MergedListing[] = data.map((apiListing) => {
          const submittedDate = apiListing.submittedAt
            ? new Date(apiListing.submittedAt)
            : new Date(apiListing.createdAt);
          const waitTimeHours = Math.floor(
            (new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60)
          );
          const sellerProfile = sellerProfiles.get(apiListing.sellerId || apiListing.seller.id);

          return {
            id: apiListing.id,
            title: apiListing.title,
            seller: {
              name: apiListing.seller.name || "Unknown Seller",
              type: apiListing.seller.type || "individual",
              username: sellerProfile?.username || apiListing.seller.name || "Unknown Seller",
              role: sellerProfile?.role || apiListing.seller.role || "seller",
            },
            priority: "medium", // Default priority as it's not in the API yet
            waitTime: waitTimeHours,
            submittedAt: submittedDate.toISOString(),
            propertyType: apiListing.propertyType,
            price: apiListing.price,
            thumbnailUrl: apiListing.featuredImageUrl,
            status: apiListing.status,
          };
        });

        setListings(mergedListings);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setError(err.message || "Failed to load listings");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || listing.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unassigned" && !listing.assignedTo) ||
      (statusFilter === "assigned" && listing.assignedTo === user?.id) ||
      (statusFilter === listing.status);

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleClaim = (listingId: string) => {
    navigate(`/staff/review/${listingId}`);
  };

  const handleView = (listingId: string) => {
    navigate(`/staff/review/${listingId}`);
  };

  const assignedToMe = listings.filter((listing) => listing.assignedTo === user?.id).length;
  const reviewedToday = 0;
  const avgReviewTime = "N/A";

  return (
    <div className="min-h-screen bg-background">

      <StaffSidebar />

      <main className="ml-60 pt-6">
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
              value={listings.length}
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <StatsCard
              title="Assigned to Me"
              value={assignedToMe}
              icon={<UserCheck className="h-5 w-5" />}
              variant="info"
            />
            <StatsCard
              title="Reviewed Today"
              value={reviewedToday}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Avg Review Time"
              value={avgReviewTime}
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
            currentUserId={user?.id || ""}
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
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StaffDashboardContent />
    </Suspense>
  );
}
