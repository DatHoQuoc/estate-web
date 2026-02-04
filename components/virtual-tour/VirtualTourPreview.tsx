// components/virtual-tour/VirtualTourPreview.tsx
"use client"

import { useState, useEffect } from "react"
import { X, MapPin, ChevronLeft, ChevronRight, Maximize2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VirtualTourViewer } from "./VirtualTourViewer"
import { useVirtualTour } from "./hooks/useVirtualTour"
import { getVirtualTour } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface Hotspot {
    id: number
    type: "info" | "scene_link"
    text?: string
    targetSceneId?: string
    pitch: number
    yaw: number
}

interface TourScene {
    sceneId: string
    sceneName: string
    panoramaUrl: string
    hotspotsJson: Hotspot[]
    positionX: number
    positionY: number
    positionZ: number
}

interface VirtualTourPreviewProps {
    tourId?: string
    scenes?: TourScene[]
    initialSceneIndex?: number
    onClose?: () => void
    fullscreen?: boolean
    autoPlay?: boolean
    autoRotate?: boolean
    height?: string
    className?: string
}

export const VirtualTourPreview = ({
    tourId,
    scenes: propScenes,
    initialSceneIndex = 0,
    onClose,
    fullscreen = true,
    autoPlay = false,
    autoRotate = false,
    height = "100vh",
    className,
}: VirtualTourPreviewProps) => {
    const [scenes, setScenes] = useState<TourScene[]>(propScenes || [])
    const [loading, setLoading] = useState(!propScenes && !!tourId)
    const [isFullscreen, setIsFullscreen] = useState(fullscreen)
    const [controlsVisible, setControlsVisible] = useState(true)
    const [autoHideTimeout, setAutoHideTimeout] = useState<NodeJS.Timeout | null>(null)

    const {
        currentScene,
        currentSceneIndex,
        transitioning,
        goToScene,
        goToSceneById,
        nextScene,
        previousScene,
        transitionToScene,
    } = useVirtualTour(scenes)

    useEffect(() => {
        if (tourId && !propScenes) {
            loadTour()
        }
    }, [tourId])

    useEffect(() => {
        if (scenes.length > 0 && initialSceneIndex !== currentSceneIndex) {
            goToScene(initialSceneIndex)
        }
    }, [scenes])

    useEffect(() => {
        if (isFullscreen) {
            const timeout = setTimeout(() => {
                setControlsVisible(false)
            }, 3000)
            setAutoHideTimeout(timeout)

            return () => {
                if (timeout) clearTimeout(timeout)
            }
        }
    }, [isFullscreen, currentSceneIndex])

    const loadTour = async () => {
        if (!tourId) return
        
        setLoading(true)
        try {
            const tour = await getVirtualTour(tourId)
            setScenes(tour.scenes)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleMouseMove = () => {
        if (isFullscreen) {
            setControlsVisible(true)
            if (autoHideTimeout) clearTimeout(autoHideTimeout)
            const timeout = setTimeout(() => {
                setControlsVisible(false)
            }, 3000)
            setAutoHideTimeout(timeout)
        }
    }

    const handleMarkerClick = async (hotspot: Hotspot) => {
        if (hotspot.type === "scene_link" && hotspot.targetSceneId) {
            const targetIndex = scenes.findIndex(s => s.sceneId === hotspot.targetSceneId)
            if (targetIndex !== -1) {
                await transitionToScene(targetIndex)
            }
        }
    }

    const handleShare = async () => {
        if (navigator.share && tourId) {
            try {
                await navigator.share({
                    title: "Virtual Tour",
                    url: `${window.location.origin}/tours/${tourId}/preview?scene=${currentSceneIndex}`,
                })
            } catch (err) {
                console.log("Share failed:", err)
            }
        }
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-muted-foreground text-sm">Loading tour...</p>
            </div>
        )
    }

    if (scenes.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-muted-foreground text-sm">No scenes available</p>
            </div>
        )
    }

    const containerClasses = cn(
        "relative bg-black",
        isFullscreen ? "fixed inset-0 z-50" : "rounded-lg overflow-hidden",
        className
    )

    return (
        <div 
            className={containerClasses} 
            onMouseMove={handleMouseMove}
            style={!isFullscreen ? { height } : undefined}
        >
            <div className={cn(
                "transition-opacity duration-500",
                transitioning ? "opacity-0" : "opacity-100"
            )}>
                <VirtualTourViewer
                    scene={currentScene}
                    mode="preview"
                    onMarkerClick={handleMarkerClick}
                    height={isFullscreen ? "100vh" : height}
                    showControls={false}
                />
            </div>

            {/* Controls Overlay */}
            <div className={cn(
                "absolute inset-0 pointer-events-none transition-opacity duration-300",
                controlsVisible || !isFullscreen ? "opacity-100" : "opacity-0"
            )}>
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {!fullscreen && (
                                <Button
                                    onClick={toggleFullscreen}
                                    variant="ghost"
                                    size="icon"
                                    className="bg-black/30 hover:bg-black/50 text-white"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            )}
                            {tourId && (
                                <Button
                                    onClick={handleShare}
                                    variant="ghost"
                                    size="icon"
                                    className="bg-black/30 hover:bg-black/50 text-white"
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {onClose && (
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="icon"
                                className="bg-black/30 hover:bg-black/50 text-white"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Navigation Arrows */}
                {scenes.length > 1 && (
                    <>
                        <Button
                            onClick={previousScene}
                            disabled={currentSceneIndex === 0 || transitioning}
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white disabled:opacity-30 pointer-events-auto"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            onClick={nextScene}
                            disabled={currentSceneIndex === scenes.length - 1 || transitioning}
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white disabled:opacity-30 pointer-events-auto"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </>
                )}

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
                    <div className="flex items-center justify-center">
                        <div className="bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4">
                            <MapPin className="h-4 w-4 text-emerald-400" />
                            <span className="text-white text-sm font-medium">
                                {currentScene?.sceneName}
                            </span>
                            <span className="text-white/60 text-xs">
                                {currentSceneIndex + 1} / {scenes.length}
                            </span>
                        </div>
                    </div>

                    {/* Scene Timeline */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {scenes.map((scene, idx) => (
                            <button
                                key={scene.sceneId}
                                onClick={() => goToScene(idx)}
                                disabled={transitioning}
                                className={cn(
                                    "h-2 rounded-full transition-all",
                                    idx === currentSceneIndex
                                        ? "w-8 bg-emerald-500"
                                        : "w-2 bg-white/40 hover:bg-white/60"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Transition Overlay */}
            {transitioning && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-sm">Transitioning...</div>
                </div>
            )}
        </div>
    )
}