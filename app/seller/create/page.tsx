"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { FormStepper } from "@/components/common/form-stepper"
import { Step1BasicInfo } from "@/components/seller/create-listing/step1-basic-info"
import { Step2Details } from "@/components/seller/create-listing/step2-details"
import { Step3MediaUpload } from "@/components/seller/create-listing/step3-media-upload"
import { Step4Review } from "@/components/seller/create-listing/step4-review"
import { Button } from "@/components/ui/button"
import { mockUser } from "@/lib/mock-data"
import { createListingDraft } from "@/lib/api-client"

interface FormData {
  // Step 1: Basic Info & Exact Location
  propertyType: string
  transactionType: string // Ensure this maps to "SALE" | "RENT" | "LEASE" for backend
  title: string
  description: string
  address: string // Street address
  countryId: string
  provinceId: string
  wardId: string
  price: number
  priceCurrency: string // e.g., "VND" or "USD"
  negotiable: boolean
  area: number // maps to areaSqm in backend
  bedrooms: number
  bathrooms: number

  // Step 2: Technical Details & Geolocation
  latitude: number
  longitude: number
  width?: number
  length?: number
  frontage?: number
  roadWidth?: number
  yearBuilt: number | null
  floor: number | null // maps to floorNumber in backend
  direction: string
  legalStatus: string
  furnitureStatus: string
  amenities: string[]
  features: string[]

  // Step 3: Media Uploads
  // Added 'url' property for cases where files are already uploaded/previewed
  images: {
    id: string;
    file?: File;
    preview: string;
    url?: string;
    uploadProgress: number;
    status: "uploading" | "success" | "error";
    isCover: boolean
  }[]
  videos: {
    id: string;
    file?: File;
    preview: string;
    url?: string;
    uploadProgress: number;
    status: "uploading" | "success" | "error";
    isCover: boolean
  }[]
  // Added for the documents section in Step 2
  documents: {
    id: string;
    name: string;
    url: string;
    size: number;
  }[]
}

const initialFormData: FormData = {
  // Step 1: Basic Info
  propertyType: "",
  transactionType: "sale",
  title: "",
  description: "",
  address: "",
  countryId: "",
  provinceId: "",
  wardId: "",
  price: 0,
  priceCurrency: "VND",
  negotiable: true,
  area: 0,
  bedrooms: 2,
  bathrooms: 1,

  // Step 2: Technical & Geolocation
  latitude: 10.762622, // Default coordinates (e.g., Ho Chi Minh City)
  longitude: 106.660172,
  width: 0,
  length: 0,
  frontage: 0,
  roadWidth: 0,
  yearBuilt: null,
  floor: null,
  direction: "",
  legalStatus: "",
  furnitureStatus: "",
  amenities: [],
  features: [],

  // Step 3: Media & Documents
  images: [],
  videos: [],
  documents: []
};

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Details" },
  { id: 3, label: "Media" },
  { id: 4, label: "Review" },
]

export default function CreateListingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepsWithStatus = steps.map((step) => ({
    ...step,
    status:
      step.id < currentStep
        ? ("completed" as const)
        : step.id === currentStep
          ? ("current" as const)
          : ("upcoming" as const),
  }))
  
  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await createListingDraft({
        title: formData.title,
        description: formData.description,
        listingType: formData.transactionType,
        propertyType: formData.propertyType,
        price: formData.price,
        priceCurrency: "USD",
        areaSqm: formData.area,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        floorNumber: formData.floor ?? undefined,
        yearBuilt: formData.yearBuilt ?? undefined,
        streetAddress: formData.address,
        countryId: formData.countryId,
        provinceId: formData.provinceId,
        wardId: formData.wardId
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save draft"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await createListingDraft({
        title: formData.title,
        description: formData.description,
        listingType: formData.transactionType,
        propertyType: formData.propertyType,
        price: formData.price,
        priceCurrency: "USD",
        areaSqm: formData.area,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        floorNumber: formData.floor ?? undefined,
        yearBuilt: formData.yearBuilt ?? undefined,
        streetAddress: formData.address,
      })
      navigate("/seller")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit listing"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        // return (
        //   formData.propertyType &&
        //   formData.title.length >= 10 &&
        //   formData.description.length >= 50 &&
        //   formData.address &&
        //   formData.price > 0 &&
        //   formData.area > 0
        // ) 
        true
      case 2:
        return true
      case 3:
        return formData.images.length >= 1
      case 4:
        return termsAccepted
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/seller")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Create New Listing
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Fill in the details to list your property
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <FormStepper
              steps={stepsWithStatus}
              currentStep={currentStep}
              onStepClick={(step) => step < currentStep && setCurrentStep(step)}
            />
          </div>

          {/* Form Content */}
          <div className="mb-8">
            {currentStep === 1 && (
              <Step1BasicInfo
                data={{
                  propertyType: formData.propertyType,
                  transactionType: formData.transactionType,
                  title: formData.title,
                  description: formData.description,
                  address: formData.address,
                  price: formData.price,
                  area: formData.area,
                  bedrooms: formData.bedrooms,
                  bathrooms: formData.bathrooms,
                  provinceId: formData.provinceId,
                  countryId: formData.countryId,
                  wardId: formData.wardId
                }}
                onChange={handleFieldChange}
              />
            )}
            {currentStep === 2 && (
              <Step2Details
                data={{
                  // Technical Dimensions & Specs
                  width: formData.width,
                  length: formData.length,
                  frontage: formData.frontage,
                  roadWidth: formData.roadWidth,
                  yearBuilt: formData.yearBuilt,
                  floor: formData.floor,
                  direction: formData.direction,

                  // Geolocation
                  latitude: formData.latitude,
                  longitude: formData.longitude,

                  // Status & Lists
                  legalStatus: formData.legalStatus,
                  furnitureStatus: formData.furnitureStatus,
                  amenities: formData.amenities,
                  features: formData.features,
                }}
                onChange={handleFieldChange}
              />
            )}
            {currentStep === 3 && (
              <Step3MediaUpload
                data={{
                  images: formData.images,
                  videos: formData.videos,
                  documents: formData.documents,
                }}
                onChange={handleFieldChange}
              />
            )}
            {currentStep === 4 && (
              <Step4Review
                data={formData}
                termsAccepted={termsAccepted}
                onTermsChange={setTermsAccepted}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid() || submitting}>
                  Submit for Review
                </Button>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}
        </div>
      </main>
    </div>
  )
}
