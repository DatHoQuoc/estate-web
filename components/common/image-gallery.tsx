"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Image as ImageType } from "@/lib/types"

interface ImageGalleryProps {
  images: ImageType[]
  coverImageIndex?: number
}

export function ImageGallery({ images, coverImageIndex = 0 }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(coverImageIndex)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
          <img
            src={images[currentIndex]?.url || "/placeholder.svg"}
            alt={images[currentIndex]?.alt || "Property image"}
            className="object-cover w-full h-full"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Expand Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Expand className="h-4 w-4" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all",
                  currentIndex === index
                    ? "border-primary"
                    : "border-transparent hover:border-primary/50"
                )}
              >
                <img
                  src={image.thumbnailUrl || image.url || "/placeholder.svg"}
                  alt={image.alt}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative w-full max-w-5xl aspect-video mx-16">
            <img
              src={images[currentIndex]?.url || "/placeholder.svg"}
              alt={images[currentIndex]?.alt || "Property image"}
              className="object-contain w-full h-full"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
