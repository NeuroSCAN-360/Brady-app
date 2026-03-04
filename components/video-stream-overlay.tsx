"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video } from "lucide-react"
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"

interface VideoStreamOverlayProps {
    streamUrl?: string
    onAnalyticsUpdate?: (isDetected: boolean, distance: number | null) => void
}

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [5, 9], [9, 10], [10, 11], [11, 12], // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
]

export function VideoStreamOverlay({ streamUrl = "http://192.168.0.161:81/stream", onAnalyticsUpdate }: VideoStreamOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const landmarkerRef = useRef<HandLandmarker | null>(null)
    const animationRef = useRef<number>()
    const isReadyRef = useRef(false)
    const lastTimeRef = useRef(-1)

    useEffect(() => {
        let isCancelled = false
        const initMediaPipe = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
                )
                const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                })
                if (!isCancelled) {
                    landmarkerRef.current = handLandmarker
                    isReadyRef.current = true
                    startDetection()
                }
            } catch (err) {
                console.error("MediaPipe Init Error:", err)
            }
        }

        initMediaPipe()

        return () => {
            isCancelled = true
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            if (landmarkerRef.current) landmarkerRef.current.close()
        }
    }, [])

    const startDetection = () => {
        const renderLoop = () => {
            if (!imageRef.current || !canvasRef.current || !landmarkerRef.current || !isReadyRef.current) return

            const img = imageRef.current
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")

            // Wait for image to load natural dimensions
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                animationRef.current = requestAnimationFrame(renderLoop)
                return
            }

            // Sync canvas dimensions to natural image dimensions to accurately draw landmarks
            if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth
            if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                try {
                    // We must pass a strictly increasing timestamp for VIDEO mode
                    const now = performance.now()
                    if (now !== lastTimeRef.current) {
                        lastTimeRef.current = now
                        const results = landmarkerRef.current.detectForVideo(img, now)

                        if (results.landmarks && results.landmarks.length > 0) {
                            const landmarks = results.landmarks[0]

                            // Calculate thumb (4) to index (8) distance in pixels
                            const thumb = landmarks[4]
                            const index = landmarks[8]
                            const dx = (thumb.x - index.x) * canvas.width
                            const dy = (thumb.y - index.y) * canvas.height
                            const distance = Math.sqrt(dx * dx + dy * dy)

                            onAnalyticsUpdate?.(true, Math.round(distance))

                            // Draw skeleton
                            ctx.lineWidth = 3

                            // Draw connections
                            ctx.strokeStyle = "rgba(46, 139, 192, 0.8)" // Brand Blue
                            HAND_CONNECTIONS.forEach(([i, j]) => {
                                const p1 = landmarks[i]
                                const p2 = landmarks[j]
                                ctx.beginPath()
                                ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
                                ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
                                ctx.stroke()
                            })

                            // Draw points
                            ctx.fillStyle = "#00B8A9" // Brand Teal
                            landmarks.forEach((p, idx) => {
                                ctx.beginPath()
                                ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI)
                                ctx.fill()

                                // Highlight thumb and index tip
                                if (idx === 4 || idx === 8) {
                                    ctx.strokeStyle = "#ffffff"
                                    ctx.lineWidth = 2
                                    ctx.stroke()
                                }
                            })

                            // Draw distance line
                            ctx.strokeStyle = "rgba(255, 0, 100, 0.8)"
                            ctx.setLineDash([5, 5])
                            ctx.beginPath()
                            ctx.moveTo(thumb.x * canvas.width, thumb.y * canvas.height)
                            ctx.lineTo(index.x * canvas.width, index.y * canvas.height)
                            ctx.stroke()
                            ctx.setLineDash([])

                        } else {
                            onAnalyticsUpdate?.(false, null)
                        }
                    }
                } catch (err) {
                    // Silently ignore detection errors when frame is not ready
                }
            }

            animationRef.current = requestAnimationFrame(renderLoop)
        }

        animationRef.current = requestAnimationFrame(renderLoop)
    }

    return (
        <Card className="card-soft rounded-xl overflow-hidden h-full flex flex-col p-0 gap-0">
            <CardHeader className="bg-gradient-to-r from-[#2E8BC0] to-[#145DA0] text-white py-3 px-4 m-0 rounded-t-xl shrink-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Video className="w-5 h-5" />
                    Live Camera Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-black flex-grow relative flex items-center justify-center min-h-[300px]">

                <img
                    ref={imageRef}
                    src={`/api/streamProxy?url=${encodeURIComponent(streamUrl)}`}
                    alt="Live Stream"
                    className="absolute inset-0 w-full h-full object-contain"
                    onError={(e) => {
                        // If stream fails to load, keep the black background but show alt text or nothing.
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        const parent = target.parentElement
                        if (parent && !parent.querySelector(".error-msg")) {
                            const msg = document.createElement("div")
                            msg.className = "error-msg absolute inset-0 flex flex-col items-center justify-center text-white/50 space-y-2 p-6 text-center"
                            msg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><path d="m15 10-4 4 6 6-4-16-18 7 6 2"></path><path d="m22 2-7 20-4-9-9-4Z"></path></svg>
                <p>Stream unavailable.</p>
                <p class="text-xs">Ensure device is reachable at ${streamUrl}</p>
              `
                            parent.appendChild(msg)
                        }
                    }}
                    crossOrigin="anonymous"
                />

                {/* The overlay canvas for MediaPipe */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                    aria-label="MediaPipe Hand Tracking Overlay"
                />

            </CardContent>
        </Card>
    )
}
