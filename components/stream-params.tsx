"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Hand, Move, Focus } from "lucide-react"

interface StreamParamsProps {
    isHandDetected?: boolean
    thumbIndexDistance?: number | null
}

export function StreamParams({ isHandDetected = false, thumbIndexDistance = null }: StreamParamsProps) {
    return (
        <Card className="card-soft rounded-xl h-full flex flex-col p-0 gap-0">
            <CardHeader className="bg-gradient-to-r from-[#00B8A9] to-[#2E8BC0] text-white py-3 px-4 m-0 rounded-t-xl shrink-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5" />
                    Stream Analytics (Live)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">

                {/* Parameter 1: Hand Detected */}
                <div className="bg-[#F0F6f9] border border-[#DDEAF1] rounded-lg p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 text-[#145DA0]">
                        <Hand className="w-4 h-4" />
                        <span className="text-sm font-medium">Hand Detected</span>
                    </div>
                    <div className="text-2xl font-bold text-[#2E8BC0]">
                        {isHandDetected ? "Yes" : "Searching..."}
                    </div>
                </div>

                {/* Parameter 2: Thumb-Index Distance */}
                <div className="bg-[#F0F6f9] border border-[#DDEAF1] rounded-lg p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 text-[#145DA0]">
                        <Move className="w-4 h-4" />
                        <span className="text-sm font-medium">Thumb-Index Dist.</span>
                    </div>
                    <div className="text-2xl font-bold text-[#2E8BC0]">
                        {thumbIndexDistance !== null ? `${thumbIndexDistance} px` : "-- px"}
                    </div>
                </div>

                {/* Parameter 3: Movement Amplitude */}
                <div className="bg-[#F0F6f9] border border-[#DDEAF1] rounded-lg p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 text-[#145DA0]">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">Amplitude</span>
                    </div>
                    <div className="text-2xl font-bold text-[#2E8BC0]">
                        --
                        {/* Placeholder value */}
                    </div>
                </div>

                {/* Parameter 4: System Status */}
                <div className="bg-[#F0F6f9] border border-[#DDEAF1] rounded-lg p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 text-[#145DA0]">
                        <Focus className="w-4 h-4" />
                        <span className="text-sm font-medium">Vision Status</span>
                    </div>
                    <div className="text-lg font-bold text-[#00B8A9] flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isHandDetected ? 'bg-green-500' : 'bg-[#00B8A9] animate-pulse'}`} />
                        {isHandDetected ? "Tracking Active" : "Initializing"}
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
