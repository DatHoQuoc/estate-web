"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  RotateCcw,
} from "lucide-react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { StatsCard } from "@/components/common/stats-card";
import { SearchBar } from "@/components/common/search-bar";
import { FilterDropdown } from "@/components/common/filter-dropdown";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createListingDraft,
  deleteListingDraft,
  listSellerListings,
  submitListingForReview,
  unpublishListing,
} from "@/lib/api-client";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "PUBLISHED", label: "Published" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Draft" },
];

function SellerListingsContent() {
  const navigate = useNavigate();

  const [listings, setListings] = useState<Listing[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    void loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await listSellerListings();
      setListings(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch = listing.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || listing.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [listings, search, statusFilter]);

  const listingStats = useMemo(() => {
    const total = listings.length;
    const published = listings.filter((l) => l.status === "PUBLISHED").length;
    const pending = listings.filter((l) => l.status === "PENDING_REVIEW").length;
    const rejected = listings.filter((l) => l.status === "REJECTED").length;
    return { total, published, pending, rejected };
  }, [listings]);


  const handleView = (id: string) => {
    navigate(`/seller/listings/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/seller/listings/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;

    setPendingDelete({ id: listing.id, title: listing.title });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setActionLoading(pendingDelete.id);
    deleteListingDraft(pendingDelete.id)
      .then(() => loadListings())
      .then(() => {
        setPendingDelete(null);
      })
      .catch((err) => {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete listing",
        );
      })
      .finally(() => {
        setActionLoading(null);
      });
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      await submitListingForReview(id);
      await loadListings();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setActionLoading(id);
    try {
      await unpublishListing(id);
      await loadListings();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloneArchived = async (listing: Listing) => {
    setActionLoading(listing.id);
    try {
      const clone = await createListingDraft({
        title: `${listing.title} (Copy)`,
        description: listing.description,
        listingType: listing.transactionType,
        propertyType: listing.propertyType,
        price: listing.price,
        priceCurrency: "VND",
        areaSqm: listing.area,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        floorNumber: listing.floor ?? undefined,
        yearBuilt: listing.yearBuilt ?? undefined,
        wardId: listing.location.wardId || undefined,
        provinceId: listing.location.provinceId || undefined,
        countryId: listing.location.countryId || undefined,
        streetAddress: listing.location.address,
        latitude: listing.location.lat,
        longitude: listing.location.lng,
      });

      navigate(`/seller/listings/${clone.id}/edit`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to clone listing");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      PUBLISHED: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Published",
      },
      PENDING_REVIEW: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "Pending Review",
      },
      DRAFT: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
      EXPIRED: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        label: "Expired",
      },
      ARCHIVED: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        label: "Archived",
      },
      DELETED: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        label: "Deleted",
      },
    };


    const variant = variants[status] || variants.DRAFT;
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          variant.bg,
          variant.text,
        )}
      >
        {variant.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />

      <main className="ml-60 pt-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                My Listings
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Operational workspace for search, edits, submissions, and listing actions.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/seller")}>Back to Dashboard</Button>


              <Button onClick={() => navigate("/seller/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Listing
              </Button>
            </div>
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
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-muted-foreground"
                    >
                      Loading listings...
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-muted-foreground"
                    >
                      No listings found
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => {
                    const isLoading = actionLoading === listing.id;
                    return (
                      <tr key={listing.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={listing.featuredImageUrl}
                              alt={listing.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {listing.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {listing.location.district},{" "}
                                {listing.location.city}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0,
                          }).format(listing.price)}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isLoading}
                              >
                                {isLoading ? "..." : "Actions"}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(listing.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>

                              {listing.status === "DRAFT" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(listing.id)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handlePublish(listing.id)}
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Submit for Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(listing.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}

                              {listing.status === "PENDING_REVIEW" && (
                                <DropdownMenuItem
                                  onClick={() => handleUnpublish(listing.id)}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Withdraw
                                </DropdownMenuItem>
                              )}

                              {listing.status === "PUBLISHED" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleUnpublish(listing.id)}
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(listing.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}

                              {listing.status === "DRAFT" && (
                                <>
                                  {
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(
                                          `/seller/listings/${listing.id}/tour/edit`,
                                        )
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Tour
                                    </DropdownMenuItem>
                                  }
                                </>
                              )}

                              {listing.status === "REJECTED" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(listing.id)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit & Resubmit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(listing.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}

                              {listing.status === "ARCHIVED" && (
                                <DropdownMenuItem
                                  onClick={() => handleCloneArchived(listing)}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Clone as Draft
                                </DropdownMenuItem>
                              )}

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Dialog
            open={Boolean(pendingDelete)}
            onOpenChange={(open) => {
              if (!open && !actionLoading) {
                setPendingDelete(null);
              }
            }}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete listing?</DialogTitle>
                <DialogDescription>
                  This will permanently delete
                  {pendingDelete ? ` \"${pendingDelete.title}\"` : " this listing"}. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPendingDelete(null)}
                  disabled={Boolean(actionLoading)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={!pendingDelete || Boolean(actionLoading)}
                >
                  {actionLoading && pendingDelete && actionLoading === pendingDelete.id
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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

export default function SellerListingsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SellerListingsContent />
    </Suspense>
  );
}
