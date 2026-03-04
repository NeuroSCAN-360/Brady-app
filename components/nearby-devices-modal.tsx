"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Radar, Smartphone, Check, ChevronRight, Wifi, X } from "lucide-react"

interface Device {
    id: string
    name: string
    ip: string
    signal: "Strong" | "Medium" | "Weak"
}

const mockDevices: Device[] = [
    { id: "dev_1", name: "FSR-Wrist-Master", ip: "192.168.0.51", signal: "Strong" },
    { id: "dev_2", name: "FSR-Tremor-Node2", ip: "192.168.0.52", signal: "Medium" },
]

export function NearbyDevicesModal({
    isOpen,
    onClose,
    onDeviceSelect
}: {
    isOpen: boolean
    onClose: () => void
    onDeviceSelect: (ip: string) => void
}) {
    const [isScanning, setIsScanning] = useState(true)
    const [devices, setDevices] = useState<Device[]>([])
    const [connectingId, setConnectingId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setIsScanning(true)
            setDevices([])
            setConnectingId(null)

            // Simulate network discovery delay
            const timer = setTimeout(() => {
                setIsScanning(false)
                setDevices(mockDevices)
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleConnect = (device: Device) => {
        setConnectingId(device.id)
        // Simulate connection delay
        setTimeout(() => {
            onDeviceSelect(device.ip)
            onClose()
            setConnectingId(null)
        }, 1000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-white/40 shadow-2xl bg-white/95 backdrop-blur-md rounded-xl [&>button]:hidden">
                <DialogHeader className="bg-gradient-to-r from-[#145DA0] to-[#2E8BC0] text-white p-6 pb-8 m-0 shrink-0 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Radar className={`w-6 h-6 text-white ${isScanning ? 'animate-spin-slow' : ''}`} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">Nearby Devices</DialogTitle>
                            <DialogDescription className="text-blue-100 mt-1">
                                {isScanning ? "Scanning local network..." : `Found ${devices.length} FSR device(s)`}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-slate-50 relative -mt-4 rounded-t-xl min-h-[250px] flex flex-col">
                    {isScanning ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#00B8A9]/20 rounded-full animate-ping" />
                                <div className="w-12 h-12 bg-[#00B8A9]/10 rounded-full flex items-center justify-center animate-pulse">
                                    <Wifi className="w-6 h-6 text-[#00B8A9]" />
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium">Looking for FSR sensors...</p>
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <Radar className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-800 font-medium">No devices found</p>
                            <p className="text-sm text-gray-500 max-w-[200px]">Ensure your device is powered on and connected to this WiFi network.</p>
                            <Button variant="outline" onClick={() => setIsScanning(true)} className="mt-4 border-[#DDEAF1] text-[#145DA0]">
                                Scan Again
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {devices.map((device) => (
                                <Card
                                    key={device.id}
                                    className="p-4 py-4 gap-0 flex flex-row items-center justify-between border-[#DDEAF1] hover:border-[#2E8BC0]/50 hover:shadow-md transition-all cursor-pointer bg-white group"
                                    onClick={() => !connectingId && handleConnect(device)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#F0F6f9] rounded-full flex items-center justify-center text-[#145DA0] group-hover:bg-[#2E8BC0] group-hover:text-white transition-colors">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{device.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{device.ip}</span>
                                                <span className="flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${device.signal === 'Strong' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                    {device.signal}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        {connectingId === device.id ? (
                                            <div className="flex items-center gap-2 text-[#00B8A9] text-sm font-medium mr-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-[#00B8A9] border-t-transparent animate-spin" />
                                                Connecting
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-[#2E8BC0] to-[#00B8A9] hover:from-[#145DA0] hover:to-[#2E8BC0] text-white shadow-sm hover:shadow-md transition-all h-9 rounded-full px-5 group-hover:scale-105"
                                            >
                                                Select <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
