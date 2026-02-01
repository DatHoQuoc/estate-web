"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, X, ShieldCheck, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getAllListingAmenities, AmenityResponse } from "@/lib/api-client"

interface UploadedFileDocument {
  id: string;
  name: string;
  url: string;
  size: number;
}

interface ListingFormData {
  documents: UploadedFileDocument[]
  amenities: string[]
}

interface Step2DetailsProps {
  data: ListingFormData
  onChange: (field: keyof ListingFormData, value: any) => void
}

export function Step2Details({ data, onChange }: Step2DetailsProps) {
  const [amenityOptions, setAmenityOptions] = useState<AmenityResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAllListingAmenities()
      .then((res) => {
        setAmenityOptions(res)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load amenities:", err)
        setIsLoading(false)
      })
  }, [])

  const handleAmenityChange = (id: string, checked: boolean) => {
    const newAmenities = checked
      ? [...data.amenities, id]
      : data.amenities.filter((a) => a !== id)
    onChange("amenities", newAmenities)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const filesArray = Array.from(e.target.files)

    // We map them to match your 'documents' interface in FormData
    const newDocuments = filesArray.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file), // For UI preview
      size: file.size,
      file: file // <-- ADD THIS: Keep the actual file for the API call later
    }))

    onChange("documents", [...data.documents, ...newDocuments])
  }

  const removeFile = (docId: string) => {
    onChange("documents", data.documents.filter(doc => doc.id !== docId))
  }

  return (
    <div className="space-y-6">
      {/* 1. AMENITIES SECTION */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Property Amenities</CardTitle>
          </div>
          <CardDescription>Select features available at this location</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenityOptions.map((option) => (
                <div
                  key={option.amenityId}
                  className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`amenity-${option.amenityId}`}
                    checked={data.amenities.includes(option.amenityId)}
                    onCheckedChange={(checked) => handleAmenityChange(option.amenityId, checked as boolean)}
                  />
                  <Label
                    htmlFor={`amenity-${option.amenityId}`}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {option.amenityName}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. DOCUMENTS SECTION */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Legal Documents</CardTitle>
          </div>
          <CardDescription>Upload proof of ownership (Red book, Pink book, or Contract)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="group relative border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2 group-hover:text-primary transition-colors" />
            <p className="text-sm font-semibold">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, PNG, or JPG (Max 10MB)</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </div>

          {/* Uploaded Files List */}
          {data.documents.length > 0 && (
            <div className="grid gap-2">
              {data.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border group">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[200px] md:max-w-md">{doc.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(doc.id)}
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