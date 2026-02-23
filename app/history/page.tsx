"use client"
import { useEffect, useState } from "react"
import { listSessions, type SessionRecord } from "@/lib/storage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Item = Pick<SessionRecord, "id" | "createdAt" | "patient" | "metrics" | "testType">

export default function HistoryPage() {
  const [items, setItems] = useState<Item[]>([])
  useEffect(() => {
    listSessions().then(setItems)
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 fade-in">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Session History</h1>
        <Button  className="btn-bounce bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]">
          <Link href="/">Home</Link>
        </Button>
      </header>

      <div className="grid gap-4">
        {items.map((it) => (
          <Card key={it.id} className="card-soft rounded-xl">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{new Date(it.createdAt).toLocaleString()}</CardTitle>
              <Link className="text-[var(--color-primary)] hover:underline" href={`/history/${it.id}`}>
                Open
              </Link>
            </CardHeader>
            <CardContent className="text-sm opacity-90">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <span className="opacity-70">Patient:</span> {it.patient.name} (Age {it.patient.age})
                </div>
                <div>
                  <span className="opacity-70">Avg Force:</span> {it.metrics.avgForce.toFixed(2)} N
                </div>
                <div>
                  <span className="opacity-70">Max Force:</span> {it.metrics.maxForce.toFixed(2)} N
                </div>
                <div>
                  <span className="opacity-70">Frequency:</span> {it.metrics.tapFrequencyHz.toFixed(2)} Hz
                </div>
              </div>
              <div className="mt-2">
                <span className="opacity-70">Test Type:</span> {it.testType}
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="opacity-70">No sessions saved yet.</p>}
      </div>
    </main>
  )
}
