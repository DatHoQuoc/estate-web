"use client"

import React, { useState, useCallback } from "react"
import {
  Upload,
  X,
  Star,
  GripVertical,
  ImageIcon,
  Video,
  Globe,
  Info,
  Check,
  Lock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ─── Exported Types ──────────────────────────────────────────────────────────

export type MediaType = "photos_only" | "photos_and_tour"

export interface UploadedFileImage {
  id: string
  file?: File
  preview: string
  url?: string
  uploadProgress: number
  status: "uploading" | "success" | "error"
  isCover: boolean
}

export interface UploadedFile360 {
  id: string
  sceneId?: string
  file?: File
  preview: string
  url?: string
  sceneName: string
  uploadProgress: number
  status: "uploading" | "success" | "error"
}

export interface UploadedFileVideo {
  id: string
  videoId?: string
  file?: File
  preview: string
  url?: string
  uploadProgress: number
  status: "uploading" | "success" | "error"
}

// ─── Props ───────────────────────────────────────────────────────────────────

type MediaValue =
  | UploadedFileImage[]
  | UploadedFile360[]
  | UploadedFileVideo[]
  | MediaType

interface Step3MediaUploadProps {
  data: {
    mediaType: MediaType
    images: UploadedFileImage[]
    images360: UploadedFile360[]
    videos: UploadedFileVideo[]
  }
  onChange: (
    field: "mediaType" | "images" | "images360" | "videos",
    value: MediaValue
  ) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SectionBadge({
  count,
  max,
  label,
}: {
  count: number
  max: number
  label: string
}) {
  const pct = (count / max) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">
        {count}/{max} {label}
      </span>
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            count >= max ? "bg-emerald-500" : "bg-primary"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground transition-colors"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-foreground text-background text-xs rounded-lg px-3 py-2 shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  )
}

function SceneSyncBadge({ sceneId }: { sceneId?: string }) {
  if (sceneId) {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
        <Check className="h-2.5 w-2.5" />
        Saved
      </span>
    )
  }
  return (
    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
      Pending
    </span>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Step3MediaUpload({ data, onChange }: Step3MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  // ── Derived ──
  const tourHasSavedScenes = data.images360.some((img) => img.sceneId)
  const photosOnlyLocked = tourHasSavedScenes
  const image360Maxed = data.images360.length >= 5
  const videoMaxed = data.videos.length >= 3
  const imageMaxed = data.images.length >= 50

  const pendingImages = data.images.filter((img) => img.file && !img.url).length
  const pending360 = data.images360.filter((img) => img.file && !img.sceneId).length
  const pendingVideos = data.videos.filter((v) => v.file && !v.videoId).length
  const hasPending = pendingImages > 0 || pending360 > 0 || pendingVideos > 0

  // ── Media type selection ──
  const handleMediaTypeChange = (type: MediaType) => {
    if (type === "photos_only" && photosOnlyLocked) return
    if (type === "photos_only" && data.images360.length > 0) {
      onChange("images360", [] as UploadedFile360[])
    }
    onChange("mediaType", type)
  }

  // ── Image drag ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      )
      handleImages(files)
    },
    [data.images]
  )

  // ── Image handlers ──
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImages(Array.from(e.target.files || []))
    e.target.value = ""
  }

  const handleImages = (files: File[]) => {
    const next: UploadedFileImage[] = files.map((file, i) => ({
      id: `img-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      uploadProgress: 100,
      status: "success" as const,
      isCover: data.images.length === 0 && i === 0,
    }))
    onChange("images", [...data.images, ...next])
  }

  const handleDeleteImage = (id: string) => {
    const next = data.images.filter((img) => img.id !== id)
    if (next.length > 0 && !next.some((img) => img.isCover)) {
      next[0] = { ...next[0], isCover: true }
    }
    onChange("images", next)
  }

  const handleSetCover = (id: string) => {
    onChange(
      "images",
      data.images.map((img) => ({ ...img, isCover: img.id === id }))
    )
  }

  // ── 360° handlers ──
  const handle360Input = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    )
    const next: UploadedFile360[] = files.map((file, i) => ({
      id: `360-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      sceneName: `Scene ${data.images360.length + i + 1}`,
      uploadProgress: 100,
      status: "success" as const,
    }))
    onChange("images360", [...data.images360, ...next])
    e.target.value = ""
  }

  const handleDelete360 = (id: string) => {
    onChange(
      "images360",
      data.images360.filter((img) => img.id !== id)
    )
  }

  const handleSceneNameChange = (id: string, name: string) => {
    onChange(
      "images360",
      data.images360.map((img) =>
        img.id === id ? { ...img, sceneName: name } : img
      )
    )
  }

  // ── Video handlers ──
  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("video/")
    )
    const next: UploadedFileVideo[] = files.map((file, i) => ({
      id: `vid-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      uploadProgress: 100,
      status: "success" as const,
    }))
    onChange("videos", [...data.videos, ...next])
    e.target.value = ""
  }

  const handleDeleteVideo = (id: string) => {
    onChange(
      "videos",
      data.videos.filter((v) => v.id !== id)
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Pending nudge ── */}
      {hasPending && (
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          You have unsaved media. Click "Save Step 3 Draft" to upload to the server.
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — Property Images
          ══════════════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="h-4.5 w-4.5 text-primary" />
              Property Images
              <span className="text-red-500 text-xs font-normal">* Required</span>
            </CardTitle>
            <SectionBadge count={data.images.length} max={50} label="photos" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-7 text-center transition-all duration-200 cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/30 hover:border-primary/60 bg-muted/30",
              imageMaxed && "opacity-40 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              !imageMaxed && document.getElementById("image-upload")?.click()
            }
          >
            <div
              className={cn(
                "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                isDragging ? "bg-primary/20" : "bg-muted"
              )}
            >
              <Upload
                className={cn(
                  "h-5 w-5",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drag & drop images here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG — max 10 MB per file · Minimum 5 required
            </p>
            <input
              type="file"
              id="image-upload"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImageInput}
              className="hidden"
              disabled={imageMaxed}
            />
          </div>

          {/* Min warning */}
          {data.images.length > 0 && data.images.length < 5 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="h-3.5 w-3.5 flex-shrink-0" />
              You need at least 5 images. {5 - data.images.length} more required.
            </div>
          )}

          {/* Image grid */}
          {data.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {data.images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative group aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all",
                    image.isCover
                      ? "border-primary shadow-sm shadow-primary/20"
                      : "border-transparent hover:border-muted-foreground/40"
                  )}
                >
                  <img
                    src={image.preview || "/placeholder.svg"}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />

                  {/* Cover badge */}
                  {image.isCover && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Cover
                    </div>
                  )}

                  {/* Saved badge */}
                  {image.url && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(image.id)}
                        className="bg-white/90 hover:bg-white text-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Star className="h-3 w-3" />
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-500/90 hover:bg-red-600 text-white h-7 w-7 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Drag handle */}
                  <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-60 transition-opacity">
                    <GripVertical className="h-4 w-4 text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — Media Type Selector
          ══════════════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Choose Media Type
            <InfoTooltip text="Select whether you want to include an interactive 360° virtual tour alongside your photos. Once tour scenes are saved to the server, you cannot switch back to Photos Only." />
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {/* Option A — Photos Only */}
            <button
              type="button"
              disabled={photosOnlyLocked}
              onClick={() => handleMediaTypeChange("photos_only")}
              className={cn(
                "relative w-full text-left rounded-xl border-2 p-4 transition-all duration-200",
                data.mediaType === "photos_only"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-muted bg-white hover:border-muted-foreground/40",
                photosOnlyLocked && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Lock icon */}
              {photosOnlyLocked && (
                <div className="absolute top-2.5 right-2.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}

              {/* Selected checkmark */}
              {data.mediaType === "photos_only" && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">Photos Only</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Standard 2D property photos
              </p>
            </button>

            {/* Option B — Photos + Virtual Tour */}
            <button
              type="button"
              onClick={() => handleMediaTypeChange("photos_and_tour")}
              className={cn(
                "relative w-full text-left rounded-xl border-2 p-4 transition-all duration-200",
                data.mediaType === "photos_and_tour"
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-muted bg-white hover:border-muted-foreground/40"
              )}
            >
              {/* Selected checkmark */}
              {data.mediaType === "photos_and_tour" && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
                  <Globe className="h-3 w-3 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">
                Photos + Virtual Tour
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add interactive 360° panorama scenes
              </p>
            </button>
          </div>

          {/* Lock warning */}
          {photosOnlyLocked && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              <Lock className="h-3.5 w-3.5 flex-shrink-0" />
              Tour scenes have been saved. You can no longer switch to Photos Only. Delete all scenes first if needed.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — Virtual Tour Builder (conditional)
          ══════════════════════════════════════════════════════════════ */}
      {data.mediaType === "photos_and_tour" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-emerald-600" />
                Virtual Tour Scenes
                <InfoTooltip text="Upload equirectangular 360° panorama images (2:1 ratio). Name each scene so buyers know which room they are viewing." />
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                Up to 5 scenes
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Upload zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer",
                "border-emerald-300/50 hover:border-emerald-500/70 bg-emerald-50/40",
                image360Maxed && "opacity-40 pointer-events-none"
              )}
              onClick={() =>
                !image360Maxed &&
                document.getElementById("upload-360")?.click()
              }
            >
              <div className="mx-auto w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Globe className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Upload 360° panorama images
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Equirectangular format (2:1 ratio) · JPG, PNG · max 50 MB each
              </p>
              <input
                type="file"
                id="upload-360"
                accept="image/jpeg,image/png"
                multiple
                onChange={handle360Input}
                className="hidden"
                disabled={image360Maxed}
              />
            </div>

            {/* Scene list */}
            {data.images360.length > 0 && (
              <div className="space-y-2">
                {data.images360.map((img, idx) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 border border-muted rounded-lg group"
                  >
                    {/* Order number */}
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-700">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-14 h-9 rounded-md overflow-hidden flex-shrink-0 border border-muted">
                      <img
                        src={img.preview || "/placeholder.svg"}
                        alt={img.sceneName}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Scene name + badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          value={img.sceneName}
                          onChange={(e) =>
                            handleSceneNameChange(img.id, e.target.value)
                          }
                          placeholder="Scene name"
                          className="text-sm font-medium bg-transparent border-b border-transparent hover:border-muted focus:border-emerald-500 focus:outline-none transition-colors w-full max-w-[160px] py-0.5"
                        />
                        <span className="inline-flex items-center gap-0.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          <Globe className="h-2.5 w-2.5" />
                          360°
                        </span>
                        <SceneSyncBadge sceneId={img.sceneId} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {img.file ? formatFileSize(img.file.size) : "Uploaded"}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete360(img.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — Property Videos
          ══════════════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Video className="h-4.5 w-4.5 text-blue-600" />
              Property Videos
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Optional · up to 3
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer",
              "border-blue-300/50 hover:border-blue-500/70 bg-blue-50/40",
              videoMaxed && "opacity-40 pointer-events-none"
            )}
            onClick={() =>
              !videoMaxed && document.getElementById("video-upload")?.click()
            }
          >
            <div className="mx-auto w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Upload video walkthroughs
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              MP4 format · max 100 MB per file
            </p>
            <input
              type="file"
              id="video-upload"
              accept="video/mp4"
              multiple
              onChange={handleVideoInput}
              className="hidden"
              disabled={videoMaxed}
            />
          </div>

          {/* Video list */}
          {data.videos.length > 0 && (
            <div className="space-y-2">
              {data.videos.map((video, idx) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 border border-muted rounded-lg group"
                >
                  <div className="w-9 h-9 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Video className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {video.file?.name || `Video ${idx + 1}`}
                      </p>
                      {video.videoId && (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          <Check className="h-2.5 w-2.5" />
                          Saved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {video.file
                        ? formatFileSize(video.file.size)
                        : video.url
                          ? "Uploaded"
                          : "Pending"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}