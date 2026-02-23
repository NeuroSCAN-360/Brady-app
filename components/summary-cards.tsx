"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SessionMetrics } from "@/lib/metrics"

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "--")

export function SummaryCards({ metrics }: { metrics: SessionMetrics }) {
  const items = [
    { k: "avg", label: "Average Force", value: `${fmt(metrics.avgForce)} N` },
    { k: "max", label: "Maximum Force", value: `${fmt(metrics.maxForce)} N` },
    { k: "freq", label: "Tap Frequency", value: `${fmt(metrics.tapFrequencyHz)} Hz` },
    { k: "var", label: "Variability (σ)", value: fmt(metrics.variability) },
  ]
  return (
    <section aria-label="Session summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.k} className="card-soft rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm opacity-80">{it.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-semibold">{it.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
