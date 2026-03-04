"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StopCircle, Save, FileDown, Download } from "lucide-react"
import { PatientHeader } from "@/components/patient-header"
import { LiveChart } from "@/components/live-chart"
import { SummaryCards } from "@/components/summary-cards"
import { parseCSV, rowsToSamples, type SamplePoint } from "@/lib/csv"
import { computeMetrics } from "@/lib/metrics"
import { exportSessionPDF } from "@/lib/pdf"
import { saveSession, type PatientMeta } from "@/lib/storage"
import { VideoStreamOverlay } from "@/components/video-stream-overlay"
import { StreamParams } from "@/components/stream-params"

const BACKEND_URL = ""
const BACKEND_WS = typeof window !== "undefined" ? `ws://${window.location.host}/api/ws` : "ws://localhost:3000/api/ws"
const LIVE_FLUSH_MS = 100
const METRICS_UPDATE_MS = 250

export default function SessionPage() {
  const params = useSearchParams()
  const router = useRouter()

  const patient: PatientMeta = {
    name: params.get("name") || "",
    age: Number(params.get("age") || "0"),
  }

  const [samples, setSamples] = useState<SamplePoint[]>([])
  const [running, setRunning] = useState(true)
  const [mounted, setMounted] = useState(false)
  const startTRef = useRef<number | null>(null)
  const [testType] = useState("Finger Tap")
  const chartRef = useRef<HTMLDivElement>(null)
  const incomingRef = useRef<SamplePoint[]>([])
  const samplesRef = useRef<SamplePoint[]>([])
  const [metrics, setMetrics] = useState(() => ({ avgForce: 0, maxForce: 0, tapFrequencyHz: 0, variability: 0, durationMs: 0 }))
  const [isHandDetected, setIsHandDetected] = useState(false)
  const [thumbIndexDistance, setThumbIndexDistance] = useState<number | null>(null)

  // Seed from uploaded CSV (if any)
  useEffect(() => {
    setMounted(true)
    if (startTRef.current == null) startTRef.current = Date.now()
    const csv = sessionStorage.getItem("uploadedCSV")
    if (csv) {
      const { rows } = parseCSV(csv)
      setSamples(rowsToSamples(rows))
      sessionStorage.removeItem("uploadedCSV")
      setRunning(false)
    }
  }, [])

  // WebSocket live stream from backend
  useEffect(() => {
    if (!running) return
    let alive = true
    let ws: WebSocket | null = null
    let flushTimer: number | null = null

    function connect() {
      try {
        ws = new WebSocket(BACKEND_WS)

        ws.onopen = () => {
          console.log('Connected to backend WebSocket')
        }

        ws.onmessage = (ev) => {
          if (!alive) return
          try {
            const msg = JSON.parse(String(ev.data || "{}")) as Partial<SamplePoint>
            console.log("WS Data received:", msg) // Debug log
            if (typeof msg.t === "number" && typeof msg.force === "number") {
              incomingRef.current.push({ t: msg.t!, force: msg.force! })
            } else {
              console.warn("WS format missing t or force:", msg)
            }
          } catch (err) {
            console.warn('Failed to parse WebSocket message:', err)
          }
        }

        ws.onerror = (err) => {
          console.error('WebSocket error:', err)
        }

        ws.onclose = () => {
          console.log('WebSocket closed')
          if (alive && running) {
            // Attempt to reconnect after 2 seconds
            setTimeout(connect, 2000)
          }
        }
      } catch (err) {
        console.error('Failed to create WebSocket:', err)
      }
    }

    flushTimer = window.setInterval(() => {
      if (!alive) return
      if (!incomingRef.current.length) return
      const batch = incomingRef.current.splice(0, incomingRef.current.length)
      setSamples((prev) => {
        const next = prev.concat(batch)
        samplesRef.current = next
        return next
      })
    }, LIVE_FLUSH_MS)

    connect()

    return () => {
      alive = false
      if (flushTimer != null) window.clearInterval(flushTimer)
      incomingRef.current = []
      try {
        ws?.close()
      } catch { }
    }
  }, [running])

  // Removed direct FSR device polling - backend handles this via WebSocket

  async function fetchCSVFromDevice() {
    try {
      // Use backend proxy to avoid CORS issues
      const res = await fetch(`/api/device/csv`, { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`)
      }
      const text = await res.text()

      // Download CSV file locally
      const blob = new Blob([text], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `FSR_Session_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      // Parse and display the data
      const { rows } = parseCSV(text)
      const parsed = rowsToSamples(rows)
      if (parsed.length) {
        setSamples(parsed)
        setRunning(false)
        alert(`Successfully loaded ${parsed.length} data points from device!\nCSV file downloaded to your computer.`)
      } else {
        alert("No valid data found in CSV from device.")
      }
    } catch (err) {
      console.error('Failed to fetch CSV:', err)
      alert("Unable to fetch CSV from device. Ensure backend server and FSR device are reachable.")
    }
  }

  useEffect(() => {
    samplesRef.current = samples
  }, [samples])

  useEffect(() => {
    const id = window.setInterval(() => {
      setMetrics(computeMetrics(samplesRef.current))
    }, METRICS_UPDATE_MS)
    return () => window.clearInterval(id)
  }, [])
  const sessionDate = useMemo(() => (startTRef.current ? new Date(startTRef.current) : new Date()), [mounted])

  async function onSave() {
    const id = crypto.randomUUID()
    await saveSession({ id, createdAt: Date.now(), patient, samples, metrics, testType })
    alert("Session saved to local history.")
  }

  async function onExport() {
    if (!chartRef.current) return
    await exportSessionPDF({
      chartElement: chartRef.current,
      patient,
      session: { date: sessionDate, durationMs: metrics.durationMs, testType },
      metrics,
    })
  }

  async function onDownloadPNG() {
    if (!chartRef.current) return
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    })
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = `Session_Chart_${sessionDate.toISOString().slice(0, 10)}.png`
    a.click()
  }

  if (!mounted) return null

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 fade-in">
      <PatientHeader patient={patient} date={sessionDate} />

      <div className="flex flex-wrap gap-3">
        <Button onClick={async () => { try { await fetch(`/api/session/stop`, { method: "POST" }) } catch { }; setRunning(false) }} className="btn-bounce bg-[var(--color-destructive)] hover:opacity-90">
          <StopCircle className="h-4 w-4 mr-2" /> Stop Session
        </Button>
        <Button variant="outline" onClick={fetchCSVFromDevice} className="btn-bounce bg-transparent">
          <Download className="h-4 w-4 mr-2" /> Fetch CSV from Device
        </Button>
        <Button variant="outline" onClick={onSave} className="btn-bounce bg-transparent  ">
          <Save className="h-4 w-4 mr-2" /> Save Session
        </Button>
        <Button onClick={onExport} className="btn-bounce bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]">
          <FileDown className="h-4 w-4 mr-2" /> Export PDF Report
        </Button>
        <Button variant="outline" onClick={onDownloadPNG} className="btn-bounce bg-transparent">
          <FileDown className="h-4 w-4 mr-2" /> Download PNG
        </Button>
        <Button variant="outline" onClick={() => router.push("/analyze")} className="btn-bounce bg-transparent">
          Analyse
        </Button>
        <div className="ml-auto">
          <Button onClick={() => router.push("/")} className="btn-bounce hover:bg-[var(--color-secondary)]">
            Home
          </Button>
        </div>
      </div>

      <div ref={chartRef}>
        <LiveChart samples={samples} />
      </div>

      {/* Camera Feed & Analytics Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <VideoStreamOverlay
            streamUrl="http://192.168.0.54/stream"
            onAnalyticsUpdate={(detected, dist) => {
              setIsHandDetected(detected)
              setThumbIndexDistance(dist)
            }}
          />
        </div>
        <div>
          <StreamParams
            isHandDetected={isHandDetected}
            thumbIndexDistance={thumbIndexDistance}
          />
        </div>
      </div>

      <SummaryCards metrics={metrics} />

      <Card className="card-soft rounded-xl p-4">
        <p className="text-sm opacity-80">
          Status: {running ? "Capturing live data..." : "Stopped"} • Samples: {samples.length} • Duration:{" "}
          {(metrics.durationMs / 1000).toFixed(1)}s
        </p>
      </Card>
    </main>
  )
}
