// components/virtual-tour/hooks/useVirtualTour.ts
import { useState, useCallback } from "react"

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

export const useVirtualTour = (initialScenes: TourScene[]) => {
    const [scenes, setScenes] = useState<TourScene[]>(initialScenes)
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
    const [transitioning, setTransitioning] = useState(false)

    const currentScene = scenes[currentSceneIndex]

    const goToScene = useCallback((sceneIndex: number) => {
        if (sceneIndex >= 0 && sceneIndex < scenes.length) {
            setCurrentSceneIndex(sceneIndex)
        }
    }, [scenes.length])

    const goToSceneById = useCallback((sceneId: string) => {
        const index = scenes.findIndex(s => s.sceneId === sceneId)
        if (index !== -1) {
            goToScene(index)
        }
    }, [scenes, goToScene])

    const nextScene = useCallback(() => {
        if (currentSceneIndex < scenes.length - 1) {
            goToScene(currentSceneIndex + 1)
        }
    }, [currentSceneIndex, scenes.length, goToScene])

    const previousScene = useCallback(() => {
        if (currentSceneIndex > 0) {
            goToScene(currentSceneIndex - 1)
        }
    }, [currentSceneIndex, goToScene])

    const transitionToScene = useCallback(async (
        sceneIndex: number,
        onTransition?: () => Promise<void>
    ) => {
        setTransitioning(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (onTransition) {
            await onTransition()
        }
        
        goToScene(sceneIndex)
        await new Promise(resolve => setTimeout(resolve, 500))
        setTransitioning(false)
    }, [goToScene])

    const updateScene = useCallback((sceneId: string, updates: Partial<TourScene>) => {
        setScenes(prev => prev.map(s => 
            s.sceneId === sceneId ? { ...s, ...updates } : s
        ))
    }, [])

    const addHotspot = useCallback((sceneId: string, hotspot: Hotspot) => {
        setScenes(prev => prev.map(s => 
            s.sceneId === sceneId 
                ? { ...s, hotspotsJson: [...s.hotspotsJson, hotspot] }
                : s
        ))
    }, [])

    const removeHotspot = useCallback((sceneId: string, hotspotId: number) => {
        setScenes(prev => prev.map(s => 
            s.sceneId === sceneId
                ? { ...s, hotspotsJson: s.hotspotsJson.filter(h => h.id !== hotspotId) }
                : s
        ))
    }, [])

    return {
        scenes,
        currentScene,
        currentSceneIndex,
        transitioning,
        goToScene,
        goToSceneById,
        nextScene,
        previousScene,
        transitionToScene,
        updateScene,
        addHotspot,
        removeHotspot,
        setScenes,
    }
}