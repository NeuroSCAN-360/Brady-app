"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSession, type SessionRecord } from "@/lib/storage"
import { LiveChart } from "@/components/live-chart"
import { SummaryCards } from "@/components/summary-cards"
import { exportSessionPDF } from "@/lib/pdf"
import { Button } from "@/components/ui/button"

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [rec, setRec] = useState<SessionRecord | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!params?.id) return
    getSession(params.id).then((r) => setRec(r || null))
  }, [params?.id])

  const date = useMemo(() => (rec ? new Date(rec.createdAt) : new Date()), [rec])

  if (!rec)
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p>Loading...</p>
      </main>
    )

  async function onExport() {
    if (!chartRef.current) return
    await exportSessionPDF({
      chartElement: chartRef.current,
      patient: rec.patient,
      session: { date, durationMs: rec.metrics.durationMs, testType: rec.testType },
      metrics: rec.metrics,
    })
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Session • {date.toLocaleString()}</h1>
          <p className="opacity-80 text-sm">
            {rec.patient.name} • Age {rec.patient.age}
            {rec.patient.id ? ` • ID ${rec.patient.id}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/history")}>
            Back
          </Button>
          <Button onClick={onExport} className="btn-bounce bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]">
            Export PDF
          </Button>
        </div>
      </header>

      <div ref={chartRef}>
        <LiveChart samples={rec.samples} title="Session Graph" />
      </div>

      <SummaryCards metrics={rec.metrics} />
    </main>
  )
}
