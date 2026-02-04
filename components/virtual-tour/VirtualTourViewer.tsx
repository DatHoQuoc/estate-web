// components/virtual-tour/VirtualTourViewer.tsx
"use client"

import { useRef } from "react"
import { usePanoramaViewer } from "./hooks/usePanoramaViewer"
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
}

interface VirtualTourViewerProps {
    scene: TourScene | null
    mode?: "view" | "edit" | "preview"
    onMarkerClick?: (hotspot: Hotspot) => void
    onClick?: (pitch: number, yaw: number) => void
    height?: string
    showControls?: boolean
    showMinimap?: boolean
    showCompass?: boolean
    className?: string
}

export const VirtualTourViewer = ({
    scene,
    mode = "view",
    onMarkerClick,
    onClick,
    height = "500px",
    showControls = true,
    className,
}: VirtualTourViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    usePanoramaViewer({
        containerRef,
        scene,
        mode,
        onMarkerClick,
        onClick,
        height,
        showControls,
    })

    return (
        <>
            <style>{`
                .marker-wrapper {
                    position: relative;
                    width: ${mode === "preview" ? "50px" : "40px"};
                    height: ${mode === "preview" ? "50px" : "40px"};
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
                    width: ${mode === "preview" ? "50px" : "32px"};
                    height: ${mode === "preview" ? "50px" : "32px"};
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
                
                .psv-container {
                    border-radius: ${mode === "preview" ? "0" : "0.5rem"};
                    overflow: hidden;
                }
            `}</style>
            <div 
                ref={containerRef} 
                className={cn("w-full", className)}
            />
        </>
    )
}