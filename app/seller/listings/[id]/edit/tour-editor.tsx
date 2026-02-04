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
import { VirtualTourEditor } from "@/components/virtual-tour/VirtualTourEditor"


export default function TourEditorPage() {
    return <VirtualTourEditor />
}