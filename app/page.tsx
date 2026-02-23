"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Brain, FileDown, History, Upload, User, BadgeIcon as IdCard, Shield } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", age: "", gender: "" })
  const canStart = form.name.trim().length > 0 && Number(form.age) > 0 && form.gender.trim().length > 0

  function startSession() {
    const params = new URLSearchParams({
      name: form.name.trim(),
      age: String(Number(form.age)),
      gender: form.gender.trim(),
    })
    router.push(`/session?${params.toString()}`)
  }

  async function uploadCSV() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv,text/csv"
    input.onchange = () => {
      const f = input.files?.[0]
      if (!f) return
      const r = new FileReader()
      r.onload = () => {
        sessionStorage.setItem("uploadedCSV", String(r.result || ""))
        startSession()
      }
      r.readAsText(f)
    }
    input.click()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-8 fade-in">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className="h-17 w-17 rounded-md bg-[var(--color-primary)] text-white grid place-items-center"
            aria-hidden
          >
            <Brain className="h-16 w-16" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-[#145DA0] font-[Montserrat] mb-2">FSR Companion App</h1>
            <p className="text-xl text-[#2E8BC0] font-medium">Clinical-grade finger-tap test capture and reporting</p>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Advanced neurological testing suite for comprehensive cognitive and motor function assessment in patients with
          neurodegenerative conditions.
        </p>
      </div>

      <Card className="card-soft rounded-xl my-6">
        <CardHeader className="bg-gradient-to-r from-[#2E8BC0] to-[#00B8A9] text-white rounded-t-lg items-stretch leading-7 flex-col my-[-25px] gap-0.5 font-bold py-2.5 justify-start mx-[-1px] px-[30px]">
          <CardTitle className="flex items-center gap-3 text-xl">
            <User className="w-6 h-6" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-[23px] mx-[-3px] my-8">
          <div className="grid gap-2 md:col-span-8">
            <Label htmlFor="name" className="text-base font-medium text-[#145DA0] flex items-center gap-2">
              {" "}
              <User className="w-4 h-4" /> Patient Name{" "}
            </Label>
            <Input
              id="name"
              placeholder="Enter Patient Name"
              className="focus-ring"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="age" className="text-base font-medium text-[#145DA0] flex items-center gap-2">
              <IdCard className="w-4 h-4" />
              Patient Age{" "}
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter Patient Age"
              className="focus-ring"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="gender" className="text-base font-medium text-[#145DA0]">
             <User className="w-4 h-4" />
              Gender
            </Label>
            <select
              id="gender"
              className="focus-ring rounded-md border border-[#DDEAF1] bg-white px-3 py-2 text-sm"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div className="md:col-span-12 flex flex-wrap gap-3 pt-1">
            <Button
              onClick={startSession}
              disabled={!canStart}
              className="btn-bounce min-h-11 px-5 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
            >
              Connect & Start
            </Button>
            <Button
              type="button"
              onClick={uploadCSV}
              className="btn-bounce min-h-11 px-5  hover:bg-[var(--color-secondary)] text-white hover:opacity-90"
            >
              <Upload className="h-4 w-4 mr-2" /> Upload CSV (Fallback)
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/history")}
              className="btn-bounce min-h-11 px-5 hover:bg-[var(--color-primary)]"
            >
              <History className="h-4 w-4 mr-2" /> View Past Sessions
            </Button>
          </div>

          <p className="text-xs opacity-70 md:col-span-12">
            The app connects to the backend server which streams live data from the FSR device via WebSocket.
          </p>
        </CardContent>
      </Card>

      <section className="grid md:grid-cols-3 gap-4" aria-label="Key features">
        <Card className="card-soft rounded-xl card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-7 w-7 text-[var(--color-primary)]" />
              <span className="font-bold text-[#145DA0]">Real-time Capture</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="opacity-90">
            Live pressure streams with zoomable charts and computed metrics.
          </CardContent>
        </Card>
        <Card className="card-soft rounded-xl card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-7 w-7 text-[var(--color-primary)]" />
              <span className="font-bold text-[#145DA0]">CSV + Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="opacity-90">
            Import from device CSV and export professional PDF summaries.
          </CardContent>
        </Card>
        <Card className="card-soft rounded-xl card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <History className="h-7 w-7 text-[var(--color-primary)]" />
              <span className="font-bold text-[#145DA0]"> Session History </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="opacity-90">Secure local storage for past sessions and re-reporting.</CardContent>
        </Card>
      </section>

      {/* Test Protocols Section */}
      <section className="mt-10" aria-label="Test protocols">
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-[#2E8BC0]/20 to-[#00B8A9]/20">
          <div className="rounded-2xl bg-white/80 dark:bg-[#1F2F3F]/60 backdrop-blur-sm">
            <Card className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#2E8BC0]/10 to-[#00B8A9]/10 rounded-lg border border-[#DDEAF1]">
              <CardHeader className="pb-2">
                <CardTitle className="inline-flex items-center gap-2 whitespace-nowrap">
                  <Shield className="h-8 w-8 text-[var(--color-primary)] shrink-0" />
                  <span className="font-bold text-[#145DA0] inline-block text-xl">Test Protocols</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="opacity-90">
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Tapping the pressure sensor with the fingertip. </li>
                  <li>Try not to pinch or squeeze just normal taps. </li>
                  <li>Tap slowly and deliberately with full-motion.</li>
                  <li>Allow the sensor to fully release between taps</li>
                  <li>Keep the sensor on a stable surface; avoid sliding or twisting during taps.</li>
                  <li>Maintain consistent finger placement throughout the test.</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">
                  For safety: stop immediately if discomfort occurs. If unsure, ask a clinician before continuing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-[#DDEAF1]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00B8A9] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#145DA0]">System Ready</span>
          </div>
          <div className="w-px h-4 bg-[#DDEAF1]" />
          <span className="text-sm text-gray-500">Integrated Backend</span>
        </div>
      </div>
    </main>
  )
}
