"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { FormStepper } from "@/components/common/form-stepper"
import { Step1BasicInfo } from "@/components/seller/create-listing/step1-basic-info"
import { Step2Details } from "@/components/seller/create-listing/step2-details"
import { Step3MediaUpload } from "@/components/seller/create-listing/step3-media-upload"
import { Step4Review } from "@/components/seller/create-listing/step4-review"
import { Button } from "@/components/ui/button"
import { mockUser } from "@/lib/mock-data"

interface FormData {
  // Step 1
  propertyType: string
  transactionType: string
  title: string
  description: string
  address: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  // Step 2
  amenities: string[]
  features: string[]
  yearBuilt: number | null
  floor: number | null
  direction: string
  legalStatus: string
  // Step 3
  images: { id: string; file: File; preview: string; uploadProgress: number; status: "uploading" | "success" | "error"; isCover: boolean }[]
  videos: { id: string; file: File; preview: string; uploadProgress: number; status: "uploading" | "success" | "error"; isCover: boolean }[]
}

const initialFormData: FormData = {
  propertyType: "",
  transactionType: "sale",
  title: "",
  description: "",
  address: "",
  price: 0,
  area: 0,
  bedrooms: 2,
  bathrooms: 1,
  amenities: [],
  features: [],
  yearBuilt: null,
  floor: null,
  direction: "",
  legalStatus: "",
  images: [],
  videos: [],
}

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Details" },
  { id: 3, label: "Media" },
  { id: 4, label: "Review" },
]

export default function CreateListingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [termsAccepted, setTermsAccepted] = useState(false)

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

  const handleSaveDraft = () => {
    console.log("Saving draft:", formData)
  }

  const handleSubmit = () => {
    console.log("Submitting for review:", formData)
    router.push("/seller")
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.propertyType &&
          formData.title.length >= 10 &&
          formData.description.length >= 50 &&
          formData.address &&
          formData.price > 0 &&
          formData.area > 0
        )
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
              onClick={() => router.push("/seller")}
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
                }}
                onChange={handleFieldChange}
              />
            )}
            {currentStep === 2 && (
              <Step2Details
                data={{
                  amenities: formData.amenities,
                  features: formData.features,
                  yearBuilt: formData.yearBuilt,
                  floor: formData.floor,
                  direction: formData.direction,
                  legalStatus: formData.legalStatus,
                }}
                onChange={handleFieldChange}
              />
            )}
            {currentStep === 3 && (
              <Step3MediaUpload
                data={{
                  images: formData.images,
                  videos: formData.videos,
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
                <Button onClick={handleSubmit} disabled={!isStepValid()}>
                  Submit for Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
