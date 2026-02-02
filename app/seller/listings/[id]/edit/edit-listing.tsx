"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
  MediaType,
} from "@/components/seller/create-listing/step3-media-upload"
import { Step4Review } from "@/components/seller/create-listing/step4-review"
import { Button } from "@/components/ui/button"
import { mockUser } from "@/lib/mock-data"
import {
  getListingDetails,
  getListingImages,
  getListingVideos,
  getVirtualTour,
  updateListingAmenities,
  uploadListingDocuments,
  uploadListingImages,
  uploadListingVideos,
  createVirtualTour,
  addTourScene,
  deleteTourScene,
  reorderTourScenes,
  publishTour,
  publishListing,
  DocumentType,
  UploadDocumentRequest,
} from "@/lib/api-client"

interface FormData {
  id: string
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
  mediaType: MediaType
  images: UploadedFileImage[]
  images360: UploadedFile360[]
  videos: UploadedFileVideo[]
  documents: {
    id: string
    name: string
    url: string
    size: number
    file?: File
  }[]
}

type MediaValue =
  | UploadedFileImage[]
  | UploadedFile360[]
  | UploadedFileVideo[]
  | MediaType

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Details" },
  { id: 3, label: "Media" },
  { id: 4, label: "Review" },
]

export default function EditListingPage() {
  const params = useParams()
  const navigate = useNavigate()
  const listingId = params.id as string

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tourId, setTourId] = useState<string | null>(null)
  const [deletedSceneIds, setDeletedSceneIds] = useState<string[]>([])

  useEffect(() => {
    loadListingData()
  }, [listingId])

  const loadListingData = async () => {
    setLoading(true)
    try {
      const listing = await getListingDetails(listingId)
      const images = await getListingImages(listingId)
      const videos = null;

      let images360: UploadedFile360[] = []
      let mediaType: MediaType = "photos_only"

      if (listing.mediaType === "photos_and_tour") {
        const tour = await getVirtualTour(listingId)
        setTourId(tour.tourId)
        mediaType = "photos_and_tour"
        images360 = tour.scenes.map((scene : any) => ({
          id: scene.sceneId,
          sceneId: scene.sceneId,
          preview: scene.imageUrl,
          url: scene.imageUrl,
          sceneName: scene.sceneName,
          uploadProgress: 100,
          status: "success" as const,
        }))
      }

      setFormData({
        id: listing.id,
        propertyType: listing.propertyType,
        transactionType: listing.listingType,
        title: listing.title,
        description: listing.description,
        address: listing.location.address,
        countryId: listing.location.countryId || "",
        provinceId: listing.location.provinceId || "",
        wardId: listing.location.wardId || "",
        price: listing.price,
        priceCurrency: "VND",
        negotiable: true,
        area: listing.areaSqm,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        latitude: listing.location.lat || 10.762622,
        longitude: listing.location.lng || 106.660172,
        yearBuilt: listing.yearBuilt || null,
        floor: listing.floorNumber || null,
        direction: listing.direction || "",
        legalStatus: listing.legalStatus || "",
        furnitureStatus: listing.furnitureStatus || "",
        amenities: listing.amenities.map((a : any) => a.id),
        features: [],
        mediaType,
        images: images.map((img) => ({
          id: img.imageId,
          preview: img.url,
          url: img.url,
          uploadProgress: 100,
          status: "success" as const,
          isCover: img.isCover,
        })),
        images360,
        videos: [],
        // videos: videos.map((vid) => ({
        //   id: vid.videoId,
        //   videoId: vid.videoId,
        //   preview: vid.url,
        //   url: vid.url,
        //   uploadProgress: 100,
        //   status: "success" as const,
        // })),
        documents: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listing")
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleMediaChange = (
    field: "mediaType" | "images" | "images360" | "videos",
    value: MediaValue
  ) => {
    if (field === "images360" && formData) {
      const incoming = value as UploadedFile360[]
      const currentIds = new Set(incoming.map((item) => item.id))

      formData.images360.forEach((item) => {
        if (!currentIds.has(item.id) && item.sceneId) {
          setDeletedSceneIds((prev) => [...prev, item.sceneId!])
        }
      })
    }

    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const saveMediaStep = async (listingId: string) => {
    if (!formData) return

    const newImages = formData.images.filter((img) => img.file && !img.url)
    if (newImages.length > 0) {
      const files = newImages.map((img) => img.file as File)
      const { urls } = await uploadListingImages(listingId, files)

      let urlIndex = 0
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              images: prev.images.map((img) => {
                if (img.file && !img.url) {
                  return { ...img, url: urls[urlIndex++] }
                }
                return img
              }),
            }
          : prev
      )
    }

    if (formData.mediaType === "photos_and_tour") {
      const new360 = formData.images360.filter((img) => img.file && !img.sceneId)
      if (new360.length > 0 && !tourId) {
        const { tourId: newTourId } = await createVirtualTour(listingId)
        setTourId(newTourId)
      }

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

        setFormData((prev) =>
          prev ? { ...prev, images360: updatedScenes } : prev
        )
      }

      if (deletedSceneIds.length > 0) {
        await Promise.all(
          deletedSceneIds.map((sceneId) => deleteTourScene(listingId, sceneId))
        )
        setDeletedSceneIds([])
      }

      const allSceneIds = formData.images360
        .filter((img) => img.sceneId)
        .map((img) => img.sceneId as string)

      if (allSceneIds.length > 1) {
        await reorderTourScenes(listingId, allSceneIds)
      }
    }

    const newVideos = formData.videos.filter((v) => v.file && !v.videoId)
    if (newVideos.length > 0) {
      const files = newVideos.map((v) => v.file as File)
      const { videoIds, urls } = await uploadListingVideos(listingId, files)

      let vidIndex = 0
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              videos: prev.videos.map((v) => {
                if (v.file && !v.videoId) {
                  return {
                    ...v,
                    videoId: videoIds[vidIndex],
                    url: urls[vidIndex++],
                  }
                }
                return v
              }),
            }
          : prev
      )
    }
  }

  const handleSaveDraft = async () => {
    if (!formData) return

    setSubmitting(true)
    setError(null)

    try {
      switch (currentStep) {
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

        case 3: {
          await saveMediaStep(formData.id)
          break
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save draft"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData) return

    setSubmitting(true)
    setError(null)

    try {
      await saveMediaStep(formData.id)

      if (formData.mediaType === "photos_and_tour" && tourId) {
        await publishTour(formData.id)
      }

      await publishListing(formData.id)

      navigate("/seller")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit listing"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isStepValid = () => {
    if (!formData) return false
    switch (currentStep) {
      case 1:
        return true
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

  const stepsWithStatus = steps.map((step) => ({
    ...step,
    status:
      step.id < currentStep
        ? ("completed" as const)
        : step.id === currentStep
          ? ("current" as const)
          : ("upcoming" as const),
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading listing...</p>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Failed to load listing</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto py-8 px-4">
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
                Edit Listing
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Update your property details
              </p>
            </div>
          </div>

          <div className="mb-8">
            <FormStepper
              steps={stepsWithStatus}
              currentStep={currentStep}
              onStepClick={(step) =>
                step < currentStep && setCurrentStep(step)
              }
            />
          </div>

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

          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 1 && currentStep < 4 && (
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
              )}

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