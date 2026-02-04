// components/virtual-tour/VirtualTourEditor.tsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Globe, Trash2, Info, Link2, Play } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { mockUser } from "@/lib/mock-data"
import {
    getVirtualTour,
    updateTourScene,
    TourSceneResponse,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { VirtualTourViewer } from "./VirtualTourViewer"
import { VirtualTourPreview } from "./VirtualTourPreview"
import { useVirtualTour } from "./hooks/useVirtualTour"

interface Hotspot {
    id: number
    type: "info" | "scene_link"
    text?: string
    targetSceneId?: string
    pitch: number
    yaw: number
}

export const VirtualTourEditor = () => {
    const params = useParams()
    const navigate = useNavigate()
    const listingId = params.id as string

    const [initialScenes, setInitialScenes] = useState<TourSceneResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hotspotDialogOpen, setHotspotDialogOpen] = useState(false)
    const [hotspotMode, setHotspotMode] = useState<"info" | "scene_link">("info")
    const [hotspotText, setHotspotText] = useState("")
    const [hotspotTargetScene, setHotspotTargetScene] = useState("")
    const [clickPosition, setClickPosition] = useState<{ pitch: number; yaw: number } | null>(null)
    const [previewMode, setPreviewMode] = useState(false)

    const {
        scenes,
        currentScene,
        currentSceneIndex,
        goToScene,
        setScenes,
    } = useVirtualTour(initialScenes)

    useEffect(() => {
        loadTour()
    }, [listingId])

    const loadTour = async () => {
        setLoading(true)
        try {
            const tour = await getVirtualTour(listingId)
            setInitialScenes(tour.scenes)
            setScenes(tour.scenes)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleClick = (pitch: number, yaw: number) => {
        setClickPosition({ pitch, yaw })
        setHotspotDialogOpen(true)
    }

    const handleAddHotspot = async () => {
        if (!currentScene || !clickPosition) return

        const newHotspot: Hotspot = {
            id: Date.now(),
            type: hotspotMode,
            pitch: clickPosition.pitch,
            yaw: clickPosition.yaw,
            ...(hotspotMode === "info" ? { text: hotspotText } : { targetSceneId: hotspotTargetScene }),
        }

        const updatedHotspots = [...currentScene.hotspotsJson, newHotspot]

        setSaving(true)
        try {
            await updateTourScene(listingId, currentScene.sceneId, {
                sceneName: currentScene.sceneName,
                positionX: currentScene.positionX,
                positionY: currentScene.positionY,
                positionZ: currentScene.positionZ,
                hotspotsJson: updatedHotspots,
            })

            setScenes((prev) =>
                prev.map((s, idx) =>
                    idx === currentSceneIndex
                        ? { ...s, hotspotsJson: updatedHotspots }
                        : s
                )
            )

            setHotspotDialogOpen(false)
            setHotspotText("")
            setHotspotTargetScene("")
            setClickPosition(null)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteHotspot = async (hotspotId: number) => {
        if (!currentScene) return

        const updatedHotspots = currentScene.hotspotsJson.filter((h) => h.id !== hotspotId)

        setSaving(true)
        try {
            await updateTourScene(listingId, currentScene.sceneId, {
                sceneName: currentScene.sceneName,
                positionX: currentScene.positionX,
                positionY: currentScene.positionY,
                positionZ: currentScene.positionZ,
                hotspotsJson: updatedHotspots,
            })

            setScenes((prev) =>
                prev.map((s, idx) =>
                    idx === currentSceneIndex
                        ? { ...s, hotspotsJson: updatedHotspots }
                        : s
                )
            )
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading tour...</p>
            </div>
        )
    }

    if (previewMode) {
        return (
            <VirtualTourPreview
                scenes={scenes}
                initialSceneIndex={currentSceneIndex}
                onClose={() => setPreviewMode(false)}
                fullscreen={true}
            />
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={mockUser} />

            <main className="pt-16">
                <div className="max-w-7xl mx-auto py-6 px-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/seller/listings/${listingId}`)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-foreground">
                                Virtual Tour Editor
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Click on the 360° panorama to add hotspots at exact positions
                            </p>
                        </div>
                        <Button onClick={() => navigate(`/seller/listings/${listingId}`)}>
                            Save & Return
                        </Button>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-emerald-600" />
                                        Scenes ({scenes.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {scenes.map((scene, idx) => (
                                        <button
                                            key={scene.sceneId}
                                            onClick={() => goToScene(idx)}
                                            className={cn(
                                                "w-full text-left p-2 rounded-lg border transition-all",
                                                idx === currentSceneIndex
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-muted hover:border-muted-foreground/40"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-emerald-700">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">
                                                        {scene.sceneName}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Scene Properties</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <Label className="text-xs">Scene Name</Label>
                                                <Input
                                                    value={currentScene?.sceneName || ""}
                                                    className="h-8 text-xs"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Order</Label>
                                                <Input
                                                    value={`${currentSceneIndex + 1} of ${scenes.length}`}
                                                    className="h-8 text-xs"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Hotspots</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {currentScene?.hotspotsJson.length === 0 && (
                                        <p className="text-xs text-muted-foreground text-center py-2">
                                            Click panorama to add
                                        </p>
                                    )}
                                    {currentScene?.hotspotsJson.map((hotspot) => (
                                        <div
                                            key={hotspot.id}
                                            className="flex items-start justify-between p-2 bg-muted rounded-lg"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {hotspot.type === "info" ? (
                                                        <Info className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                                    ) : (
                                                        <Link2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                                                    )}
                                                    <p className="text-xs font-medium truncate">
                                                        {hotspot.type === "info"
                                                            ? hotspot.text
                                                            : scenes.find((s) => s.sceneId === hotspot.targetSceneId)?.sceneName || "Unknown"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteHotspot(hotspot.id)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card className="mb-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">
                                360° Panorama Editor - {currentScene?.sceneName || "No scene"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VirtualTourViewer
                                scene={currentScene}
                                mode="edit"
                                onClick={handleClick}
                                height="500px"
                                showControls={true}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Click anywhere on the panorama to place a hotspot at that exact position. Drag to look around.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span>Final Tour Preview</span>
                                <Button onClick={() => setPreviewMode(true)} size="sm" className="h-8">
                                    <Play className="h-3 w-3 mr-2" />
                                    Preview Tour
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 py-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {scenes.map((scene, idx) => (
                                            <div key={scene.sceneId} className="flex items-center gap-1">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                                    idx === currentSceneIndex
                                                        ? "bg-emerald-500 text-white scale-110"
                                                        : "bg-muted text-muted-foreground"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                {idx < scenes.length - 1 && (
                                                    <div className="w-8 h-0.5 bg-muted" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Tour contains {scenes.length} scene{scenes.length !== 1 ? "s" : ""} with {scenes.reduce((acc, s) => acc + s.hotspotsJson.length, 0)} total hotspots
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Dialog open={hotspotDialogOpen} onOpenChange={setHotspotDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Hotspot</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Hotspot Type</Label>
                            <Select value={hotspotMode} onValueChange={(v) => setHotspotMode(v as "info" | "scene_link")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">Info Label</SelectItem>
                                    <SelectItem value="scene_link">Scene Link</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {hotspotMode === "info" && (
                            <div className="space-y-2">
                                <Label>Label Text</Label>
                                <Input
                                    value={hotspotText}
                                    onChange={(e) => setHotspotText(e.target.value)}
                                    placeholder="e.g. Smart TV, Kitchen Island"
                                />
                            </div>
                        )}

                        {hotspotMode === "scene_link" && (
                            <div className="space-y-2">
                                <Label>Link to Scene</Label>
                                <Select value={hotspotTargetScene} onValueChange={setHotspotTargetScene}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select scene" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scenes
                                            .filter((s) => s.sceneId !== currentScene?.sceneId)
                                            .map((scene) => (
                                                <SelectItem key={scene.sceneId} value={scene.sceneId}>
                                                    {scene.sceneName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {clickPosition && (
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                Position: Pitch {clickPosition.pitch.toFixed(2)}°, Yaw {clickPosition.yaw.toFixed(2)}°
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setHotspotDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddHotspot}
                            disabled={
                                saving ||
                                (hotspotMode === "info" && !hotspotText) ||
                                (hotspotMode === "scene_link" && !hotspotTargetScene)
                            }
                        >
                            {saving ? "Adding..." : "Add Hotspot"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}