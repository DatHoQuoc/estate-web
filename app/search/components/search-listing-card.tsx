"use client";

import { Bed, Bath, MapPin, Sparkles, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchListing } from "@/lib/api/search/types";
import { cn } from "@/lib/utils";

interface SearchListingCardProps {
  listing: SearchListing;
  onView?: (id: string) => void;
  onConnect?: (id: string) => void;
  onAskAI?: (id: string) => void;
  highlight?: boolean;
}

export function SearchListingCard({ listing, onView, onConnect, onAskAI, highlight }: SearchListingCardProps) {
  const cover = listing.media.images?.find((img) => img.isCover) || listing.media.images?.[0];
  const { propertyDetails, pricing, location } = listing;
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(pricing.price);

  return (
    <Card className={cn("overflow-hidden border-border transition-all duration-300", highlight ? "ring-2 ring-primary shadow-md" : "hover:border-primary/50")}>
      {cover ? (
        <div className="relative aspect-video bg-muted">
          <img src={cover.url} alt={cover.alt || listing.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/90 text-foreground capitalize shadow-sm backdrop-blur-md">
              {listing.propertyType}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground capitalize shadow-sm backdrop-blur-md">
              {listing.transactionType}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 text-white space-y-1 w-[calc(100%-1.5rem)]">
            <p className="text-xl font-bold tracking-tight shadow-sm drop-shadow-md">
              {listing.transactionType === "rent" ? `${formattedPrice}/mo` : formattedPrice}
            </p>
            <p className="text-xs text-white/90 drop-shadow flex items-center gap-1 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {location.streetAddress}, {location.district}
            </p>
          </div>
        </div>
      ) : (
          <div className="relative aspect-video bg-muted flex flex-col items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
          </div>
      )}

      <CardHeader className="space-y-1.5 pb-3">
        <CardTitle className="text-lg leading-tight text-foreground line-clamp-1">{listing.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          {propertyDetails.bedrooms !== undefined && (
             <span className="flex items-center gap-1.5">
               <Bed className="h-4 w-4 bg-muted text-foreground p-0.5 rounded-sm" /> {propertyDetails.bedrooms} bd
             </span>
          )}
          {propertyDetails.bathrooms !== undefined && (
             <span className="flex items-center gap-1.5">
               <Bath className="h-4 w-4 bg-muted text-foreground p-0.5 rounded-sm" /> {propertyDetails.bathrooms} ba
             </span>
          )}
          {propertyDetails.areaSqm !== undefined && (
             <span className="flex items-center gap-1.5">
               <Maximize2 className="h-4 w-4 bg-muted text-foreground p-0.5 rounded-sm" /> {propertyDetails.areaSqm} sqm
             </span>
          )}
        </div>

        {propertyDetails.features && propertyDetails.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs">
            {propertyDetails.features.slice(0, 3).map((feature) => (
                <span key={feature} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-medium">
                {feature}
                </span>
            ))}
            {propertyDetails.features.length > 3 && (
                <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground">+{propertyDetails.features.length - 3}</span>
            )}
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button className="flex-1 shadow-sm" onClick={() => onView?.(listing.id)}>
            View details
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => onConnect?.(listing.id)}>
            Connect
          </Button>
          <Button variant="outline" className="sm:w-auto" onClick={() => onAskAI?.(listing.id)}>
            <Sparkles className="h-4 w-4 mr-1.5 text-blue-500" /> Ask AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
