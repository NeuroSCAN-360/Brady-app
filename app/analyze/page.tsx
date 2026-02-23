"use client"
import { useRef, useState } from "react"
import { LiveChart } from "@/components/live-chart"
import type { SamplePoint } from "@/lib/csv"
import { parseCSV, rowsToSamples } from "@/lib/csv"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AnalyzePage() {
  const [samples, setSamples] = useState<SamplePoint[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [status, setStatus] = useState<string>("")
  const chartRef = useRef<HTMLDivElement>(null)

  async function onUpload() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv,text/csv"
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      const text = await f.text()
      setStatus("Analyzing...")
      try {
        const res = await fetch("/api/analyze/csv", {
          method: "POST",
          headers: { "Content-Type": "text/csv" },
          body: text,
        })
        if (!res.ok) throw new Error("backend returned " + res.status)
        const data = await res.json()
        setSamples(data.samples || [])
        setMetrics(data.metrics || null)
        setStatus("")
      } catch (e) {
        // Fallback: parse locally
        const { rows } = parseCSV(text)
        const parsed = rowsToSamples(rows)
        setSamples(parsed)
        setMetrics(null)
        setStatus("Analyzed locally (backend unavailable)")
      }
    }
    input.click()
  }

  async function downloadChartPng() {
    if (!chartRef.current || samples.length === 0) return
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    })
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "analysis_chart.png"
    a.click()
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex gap-3">
        <Button onClick={onUpload}>Upload CSV for Analysis</Button>
        <Button onClick={downloadChartPng} disabled={samples.length === 0} variant="outline">Download Chart PNG</Button>
      </div>
      {status && (
        <p className="text-sm opacity-70">{status}</p>
      )}
      {samples.length > 0 && (
        <div ref={chartRef}>
          <LiveChart samples={samples} title="Pressure vs Time (Analyzed)" />
        </div>
      )}
      {metrics && (
        <Card className="card-soft rounded-xl p-4">
          <p className="text-sm opacity-80">
            Avg: {metrics.avgForce?.toFixed?.(2)} N • Max: {metrics.maxForce?.toFixed?.(2)} N • Duration: {(metrics.durationMs / 1000).toFixed(1)} s • σ: {metrics.variability?.toFixed?.(2)}
          </p>
        </Card>
      )}
    </main>
  )
}
