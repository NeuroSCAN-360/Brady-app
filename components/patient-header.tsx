"use client"
import { Card } from "@/components/ui/card"
import { Brain, Calendar } from "lucide-react"
import type { PatientMeta } from "@/lib/storage"

export function PatientHeader({ patient, date }: { patient: PatientMeta; date: Date }) {
  return (
    <Card className="card-soft p-4 md:p-6 rounded-xl fade-in" role="region" aria-label="Patient information">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-white grid place-items-center"
            aria-hidden
          >
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-balance">{patient.name || "Unnamed Patient"}</h2>
            <p className="text-sm opacity-80">Age {patient.age}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-90">
          <Calendar className="w-5 h-5 text-[#00B8A9]" />
          <span className="text-sm">{date.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  )
}
