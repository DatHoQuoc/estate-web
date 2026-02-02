"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Globe, Trash2, Info, Link2, Play, X, MapPin } from "lucide-react"
import { Viewer } from "@photo-sphere-viewer/core"
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin"
import "@photo-sphere-viewer/core/index.css"
import "@photo-sphere-viewer/markers-plugin/index.css"
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

interface Hotspot {
    id: number
    type: "info" | "scene_link"
    text?: string
    targetSceneId?: string
    pitch: number
    yaw: number
}

export default function TourEditorPage() {
    const params = useParams()
    const navigate = useNavigate()
    const listingId = params.id as string

    const viewerRef = useRef<Viewer | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const previewContainerRef = useRef<HTMLDivElement>(null)
    const previewViewerRef = useRef<Viewer | null>(null)
    const markersPluginRef = useRef<MarkersPlugin | null>(null)
    const previewMarkersPluginRef = useRef<MarkersPlugin | null>(null)

    const [scenes, setScenes] = useState<TourSceneResponse[]>([])
    const [selectedSceneIndex, setSelectedSceneIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hotspotDialogOpen, setHotspotDialogOpen] = useState(false)
    const [hotspotMode, setHotspotMode] = useState<"info" | "scene_link">("info")
    const [hotspotText, setHotspotText] = useState("")
    const [hotspotTargetScene, setHotspotTargetScene] = useState("")
    const [clickPosition, setClickPosition] = useState<{ pitch: number; yaw: number } | null>(null)
    const [previewMode, setPreviewMode] = useState(false)
    const [previewSceneIndex, setPreviewSceneIndex] = useState(0)
    const [transitioning, setTransitioning] = useState(false)

    useEffect(() => {
        loadTour()
    }, [listingId])

    // Editor Viewer
    useEffect(() => {
        if (!containerRef.current || scenes.length === 0 || previewMode) return

        const viewer = new Viewer({
            container: containerRef.current,
            panorama: scenes[selectedSceneIndex].panoramaUrl,
            size: {
                width: "100%",
                height: "500px",
            },
            navbar: ["zoom", "move", "fullscreen"],
            defaultZoomLvl: 0,
            mousewheel: true,
            mousemove: true,
            plugins: [[MarkersPlugin, {}]],
        })

        viewerRef.current = viewer
        markersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin

        viewer.addEventListener("click", (e) => {
            if (e.data) {
                setClickPosition({
                    pitch: e.data.pitch * (180 / Math.PI),
                    yaw: e.data.yaw * (180 / Math.PI),
                })
                setHotspotDialogOpen(true)
            }
        })

        loadHotspots(selectedSceneIndex)

        return () => {
            viewer.destroy()
        }
    }, [scenes, selectedSceneIndex, previewMode])

    // Preview Viewer
    useEffect(() => {
        if (!previewContainerRef.current || scenes.length === 0 || !previewMode) return

        const viewer = new Viewer({
            container: previewContainerRef.current,
            panorama: scenes[previewSceneIndex].panoramaUrl,
            size: {
                width: "100%",
                height: "100vh",
            },
            navbar: false,
            defaultZoomLvl: 0,
            mousewheel: true,
            mousemove: true,
            plugins: [[MarkersPlugin, {}]],
        })

        previewViewerRef.current = viewer
        previewMarkersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin

        loadPreviewHotspots(previewSceneIndex)

        return () => {
            viewer.destroy()
        }
    }, [scenes, previewSceneIndex, previewMode])

    const loadTour = async () => {
        setLoading(true)
        try {
            const tour = await getVirtualTour(listingId)
            setScenes(tour.scenes)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadHotspots = (sceneIndex: number) => {
        const markersPlugin = markersPluginRef.current
        if (!markersPlugin || !scenes[sceneIndex]) return

        markersPlugin.clearMarkers()

        scenes[sceneIndex].hotspotsJson.forEach((hotspot) => {
            markersPlugin.addMarker({
                id: hotspot.id.toString(),
                position: { 
                    yaw: hotspot.yaw * (Math.PI / 180), 
                    pitch: hotspot.pitch * (Math.PI / 180) 
                },
                html: createMarkerHTML(hotspot, false),
                tooltip: hotspot.type === "info" 
                    ? hotspot.text 
                    : `Go to ${scenes.find(s => s.sceneId === hotspot.targetSceneId)?.sceneName || "scene"}`,
                data: { hotspot },
            })
        })
    }

    const loadPreviewHotspots = (sceneIndex: number) => {
        const markersPlugin = previewMarkersPluginRef.current
        if (!markersPlugin || !scenes[sceneIndex]) return

        markersPlugin.clearMarkers()

        scenes[sceneIndex].hotspotsJson.forEach((hotspot) => {
            markersPlugin.addMarker({
                id: hotspot.id.toString(),
                position: { 
                    yaw: hotspot.yaw * (Math.PI / 180), 
                    pitch: hotspot.pitch * (Math.PI / 180) 
                },
                html: createMarkerHTML(hotspot, true),
                tooltip: hotspot.type === "info" 
                    ? hotspot.text 
                    : `Go to ${scenes.find(s => s.sceneId === hotspot.targetSceneId)?.sceneName || "scene"}`,
                data: { hotspot },
            })
        })

        // Handle preview marker clicks with transition
        markersPlugin.addEventListener("select-marker", async (e) => {
            const markerData = e.marker.data as { hotspot: Hotspot }
            if (markerData.hotspot.type === "scene_link" && markerData.hotspot.targetSceneId) {
                const targetIndex = scenes.findIndex(s => s.sceneId === markerData.hotspot.targetSceneId)
                if (targetIndex !== -1 && !transitioning) {
                    await transitionToScene(targetIndex)
                }
            }
        })
    }

    const transitionToScene = async (targetIndex: number) => {
        setTransitioning(true)
        
        const viewer = previewViewerRef.current
        if (!viewer) return

        // Fade out
        const container = previewContainerRef.current
        if (container) {
            container.style.transition = "opacity 0.5s ease"
            container.style.opacity = "0"
        }

        // Wait for fade
        await new Promise(resolve => setTimeout(resolve, 500))

        // Change scene
        setPreviewSceneIndex(targetIndex)
        await viewer.setPanorama(scenes[targetIndex].panoramaUrl, { transition: false })

        // Fade in
        if (container) {
            container.style.opacity = "1"
        }

        await new Promise(resolve => setTimeout(resolve, 500))
        setTransitioning(false)
    }

    const createMarkerHTML = (hotspot: Hotspot, isPreview: boolean) => {
        if (hotspot.type === "info") {
            return `
                <div class="marker-wrapper ${isPreview ? 'marker-preview' : ''}">
                    <div class="marker-ping"></div>
                    <div class="marker-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4"/>
                            <path d="M12 8h.01"/>
                        </svg>
                    </div>
                </div>
            `
        } else {
            return `
                <div class="marker-wrapper ${isPreview ? 'marker-preview' : ''}">
                    <div class="marker-ping marker-ping-green"></div>
                    <div class="marker-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"/>
                            <path d="m12 5 7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            `
        }
    }

    const currentScene = scenes[selectedSceneIndex]

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
                    idx === selectedSceneIndex
                        ? { ...s, hotspotsJson: updatedHotspots }
                        : s
                )
            )

            const markersPlugin = markersPluginRef.current
            if (markersPlugin) {
                markersPlugin.addMarker({
                    id: newHotspot.id.toString(),
                    position: { 
                        yaw: newHotspot.yaw * (Math.PI / 180), 
                        pitch: newHotspot.pitch * (Math.PI / 180) 
                    },
                    html: createMarkerHTML(newHotspot, false),
                    tooltip: newHotspot.type === "info" 
                        ? newHotspot.text 
                        : `Go to ${scenes.find(s => s.sceneId === newHotspot.targetSceneId)?.sceneName || "scene"}`,
                    data: { hotspot: newHotspot },
                })
            }

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
                    idx === selectedSceneIndex
                        ? { ...s, hotspotsJson: updatedHotspots }
                        : s
                )
            )

            const markersPlugin = markersPluginRef.current
            if (markersPlugin) {
                markersPlugin.removeMarker(hotspotId.toString())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const startPreview = () => {
        setPreviewMode(true)
        setPreviewSceneIndex(0)
    }

    const exitPreview = () => {
        setPreviewMode(false)
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
            <>
                <style>{`
                    .marker-wrapper {
                        position: relative;
                        width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .marker-ping {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%);
                        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                    
                    .marker-ping-green {
                        background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0) 70%);
                    }
                    
                    @keyframes ping {
                        75%, 100% {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                    
                    .marker-info, .marker-link {
                        position: relative;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        color: white;
                    }
                    
                    .marker-info {
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    }
                    
                    .marker-link {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    }
                    
                    .marker-wrapper:hover .marker-info,
                    .marker-wrapper:hover .marker-link {
                        transform: scale(1.2);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                    }
                    
                    .marker-preview .marker-info,
                    .marker-preview .marker-link {
                        width: 50px;
                        height: 50px;
                    }
                    
                    .psv-container {
                        border-radius: 0;
                    }
                `}</style>

                <div className="fixed inset-0 bg-black z-50">
                    <div ref={previewContainerRef} className="w-full h-full transition-opacity duration-500" />
                    
                    <Button
                        onClick={exitPreview}
                        className="fixed top-4 right-4 z-50 bg-black/50 hover:bg-black/70"
                        size="icon"
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        <span className="text-white text-sm font-medium">
                            {scenes[previewSceneIndex]?.sceneName}
                        </span>
                        <span className="text-white/60 text-xs">
                            {previewSceneIndex + 1} / {scenes.length}
                        </span>
                    </div>

                    {transitioning && (
                        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
                            <div className="text-white text-sm">Transitioning...</div>
                        </div>
                    )}
                </div>
            </>
        )
    }

    return (
        <>
            <style>{`
                .marker-wrapper {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .marker-ping {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%);
                    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                
                .marker-ping-green {
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0) 70%);
                }
                
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                .marker-info, .marker-link {
                    position: relative;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    color: white;
                }
                
                .marker-info {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }
                
                .marker-link {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                
                .marker-wrapper:hover .marker-info,
                .marker-wrapper:hover .marker-link {
                    transform: scale(1.15);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                }
                
                .psv-container {
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
            `}</style>

            <div className="min-h-screen bg-background">
                <Navbar user={mockUser} />

                <main className="pt-16">
                    <div className="max-w-7xl mx-auto py-6 px-4">
                        {/* Header */}
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

                        {/* Top Section - 3 Columns */}
                        <div className="grid grid-cols-12 gap-4 mb-4">
                            {/* Scene List */}
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
                                                onClick={() => setSelectedSceneIndex(idx)}
                                                className={cn(
                                                    "w-full text-left p-2 rounded-lg border transition-all",
                                                    idx === selectedSceneIndex
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

                            {/* Scene Properties */}
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
                                                        value={`${selectedSceneIndex + 1} of ${scenes.length}`} 
                                                        className="h-8 text-xs"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Hotspot List */}
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

                        {/* Middle Section - Full Width 360 Viewer */}
                        <Card className="mb-4">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">
                                    360° Panorama Editor - {currentScene?.sceneName || "No scene"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div ref={containerRef} className="w-full" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Click anywhere on the panorama to place a hotspot at that exact position. Drag to look around.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Bottom Section - Preview Tour */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    <span>Final Tour Preview</span>
                                    <Button onClick={startPreview} size="sm" className="h-8">
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
                                                        idx === selectedSceneIndex 
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
        </>
    )
}