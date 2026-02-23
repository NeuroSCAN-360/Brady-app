import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import type { PatientMeta } from "./storage"
import type { SessionMetrics } from "./metrics"

export async function exportSessionPDF(opts: {
  chartElement: HTMLElement
  patient: PatientMeta
  session: { date: Date; durationMs: number; testType: string }
  metrics: SessionMetrics
}) {
  const { chartElement, patient, session, metrics } = opts
  try {
    // Prefer server-side PDF for clinical layout
    const canvas = await html2canvas(chartElement, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    })
    const chartPng = canvas.toDataURL("image/png")
  const body = {
    chartPng,
    patient,
    session: { date: session.date.toISOString(), durationMs: session.durationMs, testType: session.testType },
    metrics,
    facility: { name: "NeuroScan-360 Clinic", contact: "123 Health St, +1 (555) 000-0000" },
    clinician: { name: "Dr. [Clinician Name]", credentials: "MD, PhD", department: "Neurology" },
    documentId: crypto.randomUUID?.() || String(Date.now()),
    version: "1.0.0",
    verificationUrl: "https://example.com/verify",
  }
    const url = "/api/report/pdf"
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok && res.headers.get("content-type")?.includes("application/pdf")) {
      const blob = await res.blob()
      const dl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = dl
      a.download = `NeuroScan360_Report_${patient.name}_${session.date.toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(dl)
      return
    }
  } catch {
    // fall through to client-side
  }
  const canvas = await html2canvas(chartElement, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
  })
  const img = canvas.toDataURL("image/png")

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const M = 40
  let y = M

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("NeuroScan-360 Clinical Report", M, y)
  y += 22

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(`Date: ${session.date.toLocaleString()}`, M, y)
  y += 16
  doc.text(`Duration: ${(session.durationMs / 1000).toFixed(1)} s`, M, y)
  y += 16
  doc.text(`Test Type: ${session.testType}`, M, y)
  y += 22

  doc.setFont("helvetica", "bold")
  doc.text("Patient", M, y)
  y += 14
  doc.setFont("helvetica", "normal")
  doc.text(
    [
      `Name: ${patient.name}`,
      `Age: ${patient.age}`,
      `ID: ${patient.id ?? "-"}`,
      `Gender: ${patient.gender ?? "-"}`,
      `Notes: ${patient.notes ?? "-"}`,
    ],
    M,
    y,
  )
  y += 70

  doc.setFont("helvetica", "bold")
  doc.text("Summary", M, y)
  y += 14
  doc.setFont("helvetica", "normal")
  doc.text(
    [
      `Average Force: ${metrics.avgForce.toFixed(2)} N`,
      `Maximum Force: ${metrics.maxForce.toFixed(2)} N`,
      `Tap Frequency: ${metrics.tapFrequencyHz.toFixed(2)} Hz`,
      `Variability (σ): ${metrics.variability.toFixed(2)}`,
    ],
    M,
    y,
  )
  y += 70

  const pw = doc.internal.pageSize.getWidth() - M * 2
  const h = pw * 0.55
  doc.setFont("helvetica", "bold")
  doc.text("Session Graph", M, y)
  y += 10
  doc.addImage(img, "PNG", M, y, pw, h)
  y += h + 16

  doc.save(`NeuroScan360_Report_${patient.name}_${session.date.toISOString().slice(0, 10)}.pdf`)
}
