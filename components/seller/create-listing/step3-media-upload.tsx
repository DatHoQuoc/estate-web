"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Upload, X, Star, GripVertical, ImageIcon, Video } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadedFileImage {
  id: string;
  file?: File;
  preview: string;
  url?: string;
  uploadProgress: number;
  status: "uploading" | "success" | "error";
  isCover: boolean
}

interface UploadedFileVideo {
  id: string;
  file?: File;
  preview: string;
  url?: string;
  uploadProgress: number;
  status: "uploading" | "success" | "error";
  isCover: boolean
}


interface UploadedFileDocument {
  id: string;
  name: string;
  url: string;
  size: number;
}
type MediaValue = UploadedFileImage[] | UploadedFileVideo[] | UploadedFileDocument[];
interface Step3MediaUploadProps {
  data: {
    images: UploadedFileImage[]
    videos: UploadedFileVideo[]
    documents: UploadedFileDocument[]
  }
  onChange: (field: "images" | "videos" | "documents", value: MediaValue) => void;
}

export function Step3MediaUpload({ data, onChange }: Step3MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

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

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      )
      handleFiles(files)
    },
    [data.images]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
    e.target.value = ""
  }

  const handleFiles = (files: File[]) => {
    const newImages: UploadedFileImage[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      uploadProgress: 100,
      status: "success" as const,
      isCover: data.images.length === 0 && index === 0,
    }))

    onChange("images", [...data.images, ...newImages])
  }

  const handleDelete = (id: string) => {
    const newImages = data.images.filter((img) => img.id !== id)
    if (newImages.length > 0 && !newImages.some((img) => img.isCover)) {
      newImages[0].isCover = true
    }
    onChange("images", newImages)
  }

  const handleSetCover = (id: string) => {
    const newImages = data.images.map((img) => ({
      ...img,
      isCover: img.id === id,
    }))
    onChange("images", newImages)
  }

  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("video/")
    )

    const newVideos: UploadedFileVideo[] = files.map((file, index) => ({
      id: `video-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      uploadProgress: 100,
      status: "success" as const,
      isCover: false,
    }))

    onChange("videos", [...data.videos, ...newVideos])
    e.target.value = ""
  }

  const handleDeleteVideo = (id: string) => {
    onChange(
      "videos",
      data.videos.filter((v) => v.id !== id)
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Property Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              data.images.length >= 50 && "opacity-50 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              Drag and drop your images here
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              or click to browse (JPG, PNG, max 10MB per file)
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="image-upload"
              disabled={data.images.length >= 50}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={data.images.length >= 50}
            >
              Select Images
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              {data.images.length}/50 images uploaded (minimum 5 required)
            </p>
          </div>

          {/* Image Preview Grid */}
          {data.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative group aspect-[4/3] rounded-lg overflow-hidden border-2",
                    image.isCover ? "border-primary" : "border-transparent"
                  )}
                >
                  <img
                    src={image.preview || "/placeholder.svg"}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />

                  {/* Cover Badge */}
                  {image.isCover && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Cover
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isCover && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetCover(image.id)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Cover
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Drag Handle */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5" />
            Property Videos (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Video className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">Add video tours</p>
            <p className="text-xs text-muted-foreground mb-4">
              MP4 format, max 100MB per file (up to 3 videos)
            </p>
            <input
              type="file"
              accept="video/mp4"
              multiple
              onChange={handleVideoInput}
              className="hidden"
              id="video-upload"
              disabled={data.videos.length >= 3}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("video-upload")?.click()}
              disabled={data.videos.length >= 3}
            >
              Select Videos
            </Button>
          </div>

          {/* Video Preview */}
          {data.videos.length > 0 && (
            <div className="space-y-2">
              {data.videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {video.file?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {video.file?.size
                        ? `${(video.file.size / (1024 * 1024)).toFixed(1)} MB`
                        : video.url
                          ? "Uploaded"
                          : "Pending"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
