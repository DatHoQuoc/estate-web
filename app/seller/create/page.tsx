"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { FormStepper } from "@/components/common/form-stepper"
import { Step1BasicInfo } from "@/components/seller/create-listing/step1-basic-info"
import { Step2Details } from "@/components/seller/create-listing/step2-details"
import {
  Step3MediaUpload,
  UploadedFileImage,
  UploadedFile360,
  UploadedFileVideo,
} from "@/components/seller/create-listing/step3-media-upload"
import { Step4Review } from "@/components/seller/create-listing/step4-review"
import { Button } from "@/components/ui/button"
import { mockUser } from "@/lib/mock-data"
import {
  createListingDraft,
  updateListingAmenities,
  uploadListingDocuments,
  DocumentType,
  UploadDocumentRequest,
  // ── Tour APIs ── (you implement these in api-client)
  createVirtualTour,       // (listingId) => Promise<{ tourId: string }>
  addTourScene,            // (listingId, file, sceneData) => Promise<{ sceneId: string }>
  deleteTourScene,         // (listingId, sceneId) => Promise<void>
  reorderTourScenes,       // (listingId, sceneIds: string[]) => Promise<void>
  publishTour,             // (listingId) => Promise<void>
  // ── Image / Video upload APIs ── (you implement these in api-client)
  uploadListingImages,     // (listingId, files: File[]) => Promise<{ urls: string[] }>
  uploadListingVideos,     // (listingId, files: File[]) => Promise<{ videoIds: string[], urls: string[] }>
  publishListing,
} from "@/lib/api-client"

import {MediaType} from "@/components/seller/create-listing/step3-media-upload"
// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  id: string

  // Step 1
  propertyType: string
  transactionType: string
  title: string
  description: string
  address: string
  countryId: string
  provinceId: string
  wardId: string
  price: number
  priceCurrency: string
  negotiable: boolean
  area: number
  bedrooms: number
  bathrooms: number

  // Step 2
  latitude: number
  longitude: number
  width?: number
  length?: number
  frontage?: number
  roadWidth?: number
  yearBuilt: number | null
  floor: number | null
  direction: string
  legalStatus: string
  furnitureStatus: string
  amenities: string[]
  features: string[]

  // Step 3 — uses the exported types from Step3MediaUpload
  mediaType: MediaType
  images: UploadedFileImage[]
  images360: UploadedFile360[]
  videos: UploadedFileVideo[]

  // Step 2 documents
  documents: {
    id: string
    name: string
    url: string
    size: number
    file?: File
  }[]
}

// What Step3's onChange sends as its second argument
type MediaValue =
  | UploadedFileImage[]
  | UploadedFile360[]
  | UploadedFileVideo[]
  | MediaType

// ─── Initial State ───────────────────────────────────────────────────────────

const initialFormData: FormData = {
  id: "",

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

  latitude: 10.762622,
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
  mediaType: "photos_only" as MediaType,
  images: [],
  images360: [],
  videos: [],
  documents: [],
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Details" },
  { id: 3, label: "Media" },
  { id: 4, label: "Review" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateListingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // tourId is the container returned by POST /tours.
  // Kept separate so we know whether to create or reuse.
  const [tourId, setTourId] = useState<string | null>(null)

  // When a 360° item that already has a sceneId is deleted in Step 3,
  // we can't call DELETE immediately (user might undo).
  // Instead we queue the sceneId here and flush on save.
  const [deletedSceneIds, setDeletedSceneIds] = useState<string[]>([])

  // ── Stepper ──
  const stepsWithStatus = steps.map((step) => ({
    ...step,
    status:
      step.id < currentStep
        ? ("completed" as const)
        : step.id === currentStep
          ? ("current" as const)
          : ("upcoming" as const),
  }))

  // ── Generic handler (Step 1, Step 2) ──
  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ── Media handler (Step 3) ──
  // Intercepts 360° deletions to capture sceneIds before they leave state.
  const handleMediaChange = (
    field: "mediaType" | "images" | "images360" | "videos",
    value: MediaValue
  ) => {
    // Only intercept 360 deletions for sceneId tracking
    if (field === "images360") {
      const incoming = value as UploadedFile360[]
      const currentIds = new Set(incoming.map((item) => item.id))

      formData.images360.forEach((item) => {
        if (!currentIds.has(item.id) && item.sceneId) {
          setDeletedSceneIds((prev) => [...prev, item.sceneId!])
        }
      })
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ── Navigation ──
  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // ── Validation ──
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true
        // TODO: uncomment when ready
        // return (
        //   formData.propertyType &&
        //   formData.title.length >= 10 &&
        //   formData.description.length >= 50 &&
        //   formData.address &&
        //   formData.price > 0 &&
        //   formData.area > 0
        // )
      case 2:
        return true
      case 3:
        return formData.images.length >= 5
      case 4:
        return termsAccepted
      default:
        return false
    }
  }

  // ── Save Draft ────────────────────────────────────────────────────────────
  // Each case handles exactly one step's persistence.

  const handleSaveDraft = async () => {
    if (!formData.id && currentStep > 1) {
      setError("Please save Step 1 first to create a draft.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      switch (currentStep) {
        // ── Case 1: create the listing draft ──
        case 1: {
          const newListing = await createListingDraft({
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
            wardId: formData.wardId,
          })
          setFormData((prev) => ({ ...prev, id: newListing.id }))
          break
        }

        // ── Case 2: amenities + documents ──
        case 2: {
          const newFiles = formData.documents
            .filter((doc) => doc.file)
            .map((doc) => doc.file as File)

          const documentRequests: UploadDocumentRequest[] = newFiles.map(() => ({
            documentType: DocumentType.OWNERSHIP_CERTIFICATE,
            documentNumber: "DOC-001-UPDATED",
            issueDate: new Date().toISOString(),
            issuingAuthority: "Local Authority",
            expiryDate: new Date().toISOString(),
          }))

          await Promise.all([
            updateListingAmenities(formData.id, formData.amenities),
            newFiles.length > 0
              ? uploadListingDocuments(formData.id, newFiles, documentRequests)
              : Promise.resolve(),
          ])
          break
        }

        // ── Case 3: images + virtual tour + videos ──
        case 3: {
          await saveMediaStep(formData.id)
          break
        }

        // ── Case 4: nothing extra — publish is in handleSubmit ──
        case 4: {
          break
        }

        default:
          console.warn("No save handler for this step")
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save draft"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Media persistence (extracted so handleSubmit can reuse it) ──
  const saveMediaStep = async (listingId: string) => {
    // ── a) Upload regular images ──
    const newImages = formData.images.filter((img) => img.file && !img.url)
    if (newImages.length > 0) {
      const files = newImages.map((img) => img.file as File)
      const { urls } = await uploadListingImages(listingId, files)

      let urlIndex = 0
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => {
          if (img.file && !img.url) {
            return { ...img, url: urls[urlIndex++] }
          }
          return img
        }),
      }))
    }

    // ── b, c, d, f) Tour logic — only if seller opted in ──
    if (formData.mediaType === "photos_and_tour") {
      // b) Create tour container if needed
      const new360 = formData.images360.filter((img) => img.file && !img.sceneId)
      if (new360.length > 0 && !tourId) {
        const { tourId: newTourId } = await createVirtualTour(listingId)
        setTourId(newTourId)
      }

      // c) Upload each new scene
      if (new360.length > 0) {
        const updatedScenes = [...formData.images360]

        for (const scene of new360) {
          const { sceneId } = await addTourScene(listingId, scene.file as File, {
            sceneName: scene.sceneName,
            positionX: 0.0,
            positionY: 0.0,
            positionZ: 0.0,
            hotspotsJson: [],
          })

          const idx = updatedScenes.findIndex((s) => s.id === scene.id)
          if (idx !== -1) {
            updatedScenes[idx] = { ...updatedScenes[idx], sceneId }
          }
        }

        setFormData((prev) => ({ ...prev, images360: updatedScenes }))
      }

      // d) Flush deleted scenes
      if (deletedSceneIds.length > 0) {
        await Promise.all(
          deletedSceneIds.map((sceneId) => deleteTourScene(listingId, sceneId))
        )
        setDeletedSceneIds([])
      }

      // f) Reorder scenes
      const allSceneIds = formData.images360
        .filter((img) => img.sceneId)
        .map((img) => img.sceneId as string)

      if (allSceneIds.length > 1) {
        await reorderTourScenes(listingId, allSceneIds)
      }
    }

    // ── e) Upload videos — always runs regardless of mediaType ──
    const newVideos = formData.videos.filter((v) => v.file && !v.videoId)
    if (newVideos.length > 0) {
      const files = newVideos.map((v) => v.file as File)
      const { videoIds, urls } = await uploadListingVideos(listingId, files)

      let vidIndex = 0
      setFormData((prev) => ({
        ...prev,
        videos: prev.videos.map((v) => {
          if (v.file && !v.videoId) {
            return { ...v, videoId: videoIds[vidIndex], url: urls[vidIndex++] }
          }
          return v
        }),
      }))
    }
  }

  // ── Final Submit ──
  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      let listingId = formData.id

      // If somehow no draft exists, create one first
      if (!listingId) {
        const newListing = await createListingDraft({
          title: formData.title,
          description: formData.description,
          listingType: formData.transactionType,
          propertyType: formData.propertyType,
          price: formData.price,
          priceCurrency: "VND",
          areaSqm: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          floorNumber: formData.floor ?? undefined,
          yearBuilt: formData.yearBuilt ?? undefined,
          streetAddress: formData.address,
        })
        listingId = newListing.id
        setFormData((prev) => ({ ...prev, id: listingId }))
      }

      // Make sure all media is persisted before publishing
      await saveMediaStep(listingId)

      // Publish the virtual tour if one exists
      if (formData.mediaType === "photos_and_tour" && tourId) {
        await publishTour(listingId)
      }

      await publishListing(listingId)
      navigate("/seller")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit listing"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

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
              onStepClick={(step) =>
                step < currentStep && setCurrentStep(step)
              }
            />
          </div>

          {/* Form Content */}
          <div className="mb-8">
            {currentStep === 1 && (
              <Step1BasicInfo
                data={{
                  propertyType: formData.propertyType,
                  listingType: formData.transactionType,
                  title: formData.title,
                  description: formData.description,
                  streetAddress: formData.address,
                  price: formData.price,
                  areaSqm: formData.area,
                  bedrooms: formData.bedrooms,
                  bathrooms: formData.bathrooms,
                  provinceId: formData.provinceId,
                  countryId: formData.countryId,
                  wardId: formData.wardId,
                }}
                onChange={handleFieldChange}
              />
            )}

            {currentStep === 2 && (
              <Step2Details
                data={{
                  documents: formData.documents,
                  amenities: formData.amenities,
                }}
                onChange={handleFieldChange}
              />
            )}

            {currentStep === 3 && (
              <Step3MediaUpload
                data={{
                  mediaType: formData.mediaType,
                  images: formData.images,
                  images360: formData.images360,
                  videos: formData.videos,
                }}
                onChange={handleMediaChange}
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
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center">Saving...</span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Step {currentStep} Draft
                  </>
                )}
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || submitting}
                >
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