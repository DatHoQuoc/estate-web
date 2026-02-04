// components/virtual-tour/hooks/usePanoramaViewer.ts
import { useEffect, useRef } from "react"
import { Viewer } from "@photo-sphere-viewer/core"
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin"
import "@photo-sphere-viewer/core/index.css"
import "@photo-sphere-viewer/markers-plugin/index.css"

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

interface UsePanoramaViewerProps {
    containerRef: React.RefObject<HTMLDivElement | null> 
    scene: TourScene | null
    mode: "view" | "edit" | "preview"
    onMarkerClick?: (hotspot: Hotspot) => void
    onClick?: (pitch: number, yaw: number) => void
    height?: string
    showControls?: boolean
}

export const usePanoramaViewer = ({
    containerRef,
    scene,
    mode,
    onMarkerClick,
    onClick,
    height = "500px",
    showControls = true,
}: UsePanoramaViewerProps) => {
    const viewerRef = useRef<Viewer | null>(null)
    const markersPluginRef = useRef<MarkersPlugin | null>(null)

    useEffect(() => {
        if (!containerRef.current || !scene) return

        const navbar = showControls ? ["zoom", "move", "fullscreen"] : false

        const viewer = new Viewer({
            container: containerRef.current,
            panorama: scene.panoramaUrl,
            size: {
                width: "100%",
                height: height,
            },
            navbar: navbar,
            defaultZoomLvl: 0,
            mousewheel: true,
            mousemove: true,
            plugins: [[MarkersPlugin, {}]],
        })

        viewerRef.current = viewer
        markersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin

        if (onClick && mode === "edit") {
            viewer.addEventListener("click", (e) => {
                if (e.data) {
                    onClick(
                        e.data.pitch * (180 / Math.PI),
                        e.data.yaw * (180 / Math.PI)
                    )
                }
            })
        }

        loadMarkers()

        return () => {
            viewer.destroy()
        }
    }, [scene, mode])

    const loadMarkers = () => {
        const markersPlugin = markersPluginRef.current
        if (!markersPlugin || !scene) return

        markersPlugin.clearMarkers()

        scene.hotspotsJson.forEach((hotspot) => {
            const markerHTML = createMarkerHTML(hotspot, mode === "preview")

            markersPlugin.addMarker({
                id: hotspot.id.toString(),
                position: {
                    yaw: hotspot.yaw * (Math.PI / 180),
                    pitch: hotspot.pitch * (Math.PI / 180),
                },
                html: markerHTML,
                tooltip: hotspot.type === "info"
                    ? hotspot.text
                    : `Go to scene`,
                data: { hotspot },
            })
        })

        if (onMarkerClick) {
            markersPlugin.addEventListener("select-marker", (e) => {
                const markerData = e.marker.data as { hotspot: Hotspot }
                onMarkerClick(markerData.hotspot)
            })
        }
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

    const addMarker = (hotspot: Hotspot) => {
        const markersPlugin = markersPluginRef.current
        if (!markersPlugin) return

        markersPlugin.addMarker({
            id: hotspot.id.toString(),
            position: {
                yaw: hotspot.yaw * (Math.PI / 180),
                pitch: hotspot.pitch * (Math.PI / 180),
            },
            html: createMarkerHTML(hotspot, mode === "preview"),
            tooltip: hotspot.type === "info"
                ? hotspot.text
                : `Go to scene`,
            data: { hotspot },
        })
    }

    const removeMarker = (hotspotId: number) => {
        const markersPlugin = markersPluginRef.current
        if (!markersPlugin) return

        markersPlugin.removeMarker(hotspotId.toString())
    }

    const setPanorama = async (url: string) => {
        if (!viewerRef.current) return
        await viewerRef.current.setPanorama(url, { transition: false })
    }

    return {
        viewer: viewerRef.current,
        markersPlugin: markersPluginRef.current,
        addMarker,
        removeMarker,
        setPanorama,
    }
}