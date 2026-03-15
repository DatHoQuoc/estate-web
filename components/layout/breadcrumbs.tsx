import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getPublishedListingDetails } from "@/lib/api-client";

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [listingTitle, setListingTitle] = useState<string>("");

  const isDiscoverListingDetail =
    pathnames[0] === "discover" && pathnames[1] === "listings" && Boolean(pathnames[2]);
  const listingId = isDiscoverListingDetail ? pathnames[2] : "";

  useEffect(() => {
    if (!isDiscoverListingDetail || !listingId) {
      setListingTitle("");
      return;
    }

    let mounted = true;
    getPublishedListingDetails(listingId)
      .then((listing) => {
        if (!mounted) return;
        setListingTitle(listing.title || "");
      })
      .catch(() => {
        if (!mounted) return;
        setListingTitle("");
      });

    return () => {
      mounted = false;
    };
  }, [isDiscoverListingDetail, listingId]);

  const formattedSegments = useMemo(
    () =>
      pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        if (isDiscoverListingDetail && isLast) {
          return listingTitle || "Listing Detail";
        }

        return value
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }),
    [isDiscoverListingDetail, listingTitle, pathnames],
  );

  if (pathnames.length === 0) {
    return null; // Don't show breadcrumbs on home page
  }

  if (["seller", "admin"].includes(pathnames[0])) {
    return null;
  }
  // auth
  const { user } = useAuth();
  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4 px-6 mt-4">
      <Link
        to={user ? "/discover" : "/"}
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const formattedValue = formattedSegments[index] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            {last ? (
              <span className="text-foreground" aria-current="page">
                {formattedValue}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-foreground transition-colors"
              >
                {formattedValue}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
