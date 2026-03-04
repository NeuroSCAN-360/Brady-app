"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Brain, FileDown, History, Upload, User, BadgeIcon as IdCard, Shield, Mail, Lock, LogOut, Radar } from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { NearbyDevicesModal } from "@/components/nearby-devices-modal"

export default function HomePage() {
  const router = useRouter()

  // App State
  const [form, setForm] = useState({ name: "", age: "", gender: "" })
  const canStart = form.name.trim().length > 0 && Number(form.age) > 0 && form.gender.trim().length > 0

  // Auth State
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [authError, setAuthError] = useState("")

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isNearbyOpen, setIsNearbyOpen] = useState(false)
  const [activeDeviceIp, setActiveDeviceIp] = useState<string>("192.168.0.51")

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setIsAuthModalOpen(false) // Close modal successfully on login
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setAuthError("")

    if (isSignUpMode) {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        }
      })
      if (error) setAuthError(error.message)
      else setAuthError("Check your email for the confirmation link!")
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      })
      if (error) setAuthError(error.message)
    }
  }

  async function handleGoogleAuth() {
    setAuthError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      }
    })
    if (error) setAuthError(error.message)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setAuthEmail("")
    setAuthPassword("")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#145DA0]">Loading...</div>
  }

  const openAuthModal = (signUp: boolean) => {
    setIsSignUpMode(signUp)
    setAuthError("")
    setAuthEmail("")
    setAuthPassword("")
    setIsAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-[#F0F6f9] to-[#00B8A9]/5">
      {/* Subtle floating elements for depth */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-16 w-32 h-32 bg-[#145DA0]/20 rounded-full blur-2xl animate-pulse" />
        <div
          className="absolute top-60 right-32 w-48 h-48 bg-[#00B8A9]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-[#2E8BC0]/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#2E8BC0 1px, transparent 1px),
            linear-gradient(90deg, #2E8BC0 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-8 fade-in relative z-10">

        {/* Top Right Header Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10 hidden md:flex">
          <div className="flex items-center gap-2 border-r border-[#DDEAF1]/50 pr-4 mr-1">
            <Button
              variant="outline"
              onClick={() => setIsNearbyOpen(true)}
              className="bg-white/80 border-[#DDEAF1] text-[#145DA0] hover:bg-[#F0F6f9] hover:text-[#2E8BC0] rounded-full px-4 shadow-sm transition-all h-9"
            >
              <Radar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {activeDeviceIp !== "192.168.0.51" ? activeDeviceIp : "Connect Device"}
              </span>
            </Button>
            {activeDeviceIp !== "192.168.0.51" && (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>

          {user ? (
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-[#145DA0] border-[#DDEAF1] hover:bg-[#F0F6f9]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => openAuthModal(false)}
                className="text-[#145DA0] border-[#DDEAF1] bg-white/80 hover:bg-[#F0F6f9] shadow-sm"
              >
                Sign In
              </Button>
              <Button
                onClick={() => openAuthModal(true)}
                className="bg-[#2E8BC0] hover:bg-[#145DA0] text-white shadow-sm"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Main Header */}
        <div className="text-center mb-16 pt-8 md:pt-4">
          {/* Mobile alternative controls */}
          <div className="flex flex-wrap md:hidden items-center justify-center gap-3 mb-8 w-full px-4">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsNearbyOpen(true)}
                className="bg-white/80 border-[#DDEAF1] text-[#145DA0] hover:bg-[#F0F6f9] hover:text-[#2E8BC0] rounded-full px-4 shadow-sm transition-all h-10 flex items-center justify-center max-w-[160px]"
              >
                <Radar className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm font-medium truncate">
                  {activeDeviceIp !== "192.168.0.51" ? activeDeviceIp : "Connect"}
                </span>
              </Button>
              {activeDeviceIp !== "192.168.0.51" && (
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 absolute -top-0.5 -right-0.5 border border-white animate-pulse" />
              )}
            </div>

            {user ? (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-[#145DA0] border-[#DDEAF1] bg-white/80 hover:bg-[#F0F6f9] rounded-full px-4 h-10 shadow-sm"
              >
                <LogOut className="w-4 h-4 mr-2 shrink-0" />
                Sign Out
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => openAuthModal(false)}
                  className="text-[#145DA0] border-[#DDEAF1] bg-white/80 hover:bg-[#F0F6f9] shadow-sm rounded-full px-4 h-10"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => openAuthModal(true)}
                  className="bg-[#2E8BC0] hover:bg-[#145DA0] text-white shadow-sm rounded-full px-4 h-10"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-6">
            <div
              className="h-14 w-14 md:h-17 md:w-17 rounded-md bg-[var(--color-primary)] text-white grid place-items-center shrink-0"
              aria-hidden
            >
              <Brain className="h-10 w-10 md:h-16 md:w-16" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#145DA0] font-[Montserrat] mb-2 leading-tight">FSR Companion App</h1>
              <p className="text-base sm:text-lg md:text-xl text-[#2E8BC0] font-medium leading-snug">
                Clinical-grade finger-tap test capture
                <br className="hidden md:block" /> and reporting
              </p>
            </div>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Advanced neurological testing suite for comprehensive cognitive and motor function assessment in patients with
            neurodegenerative conditions.
          </p>
        </div>

        {/* Patient Information Form (Requires Auth) */}
        {user ? (
          <Card className="shadow-2xl backdrop-blur-md bg-white/95 border-white/40 ring-1 ring-[#145DA0]/10 hover:shadow-3xl transition-all duration-300 rounded-xl my-6 overflow-hidden p-0 card-soft">
            <CardHeader className="bg-gradient-to-r from-[#2E8BC0] to-[#00B8A9] text-white rounded-t-lg items-stretch leading-7 flex-col gap-0.5 font-bold py-4 justify-start px-6 shrink-0 m-0">
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="w-6 h-6" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-[23px] px-4 md:px-0 mx-0 md:mx-[-3px] my-6 md:my-8">
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

              <div className="md:col-span-12 flex flex-col md:flex-row flex-wrap gap-3 pt-2">
                <Button
                  onClick={startSession}
                  disabled={!canStart}
                  className="btn-bounce min-h-11 px-5 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] w-full md:w-auto"
                >
                  Connect & Start
                </Button>
                <Button
                  type="button"
                  onClick={uploadCSV}
                  className="btn-bounce min-h-11 px-5 hover:bg-[var(--color-secondary)] text-white hover:opacity-90 w-full md:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" /> Upload CSV (Fallback)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/history")}
                  className="btn-bounce min-h-11 px-5 hover:bg-[var(--color-primary)] w-full md:w-auto"
                >
                  <History className="h-4 w-4 mr-2" /> View Past Sessions
                </Button>
              </div>

              <p className="text-xs opacity-70 md:col-span-12 mt-2">
                The app connects to the backend server which streams live data from the FSR device via WebSocket.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8 md:py-10 px-4 my-6 bg-gradient-to-r from-[#2E8BC0]/5 to-[#00B8A9]/5 rounded-xl border border-[#DDEAF1] mx-4 md:mx-0 shadow-sm">
            <p className="text-[#145DA0] font-medium text-base md:text-lg mb-4">Please sign in to access patient tools and begin a session.</p>
            <Button onClick={() => openAuthModal(false)} className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] shadow-md w-full sm:w-auto min-h-11">
              Sign In / Enroll
            </Button>
          </div>
        )}

        {/* Features Overview (Always Visible) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0" aria-label="Key features">
          <Card className="group shadow-xl backdrop-blur-md bg-white/95 border-white/40 ring-1 ring-[#145DA0]/10 hover:shadow-2xl hover:ring-[#145DA0]/20 transition-all duration-300 hover:-translate-y-1 card-soft rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-7 w-7 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-[#145DA0]">Real-time Capture</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="opacity-90">
              Live pressure streams with zoomable charts and computed metrics.
            </CardContent>
          </Card>
          <Card className="group shadow-xl backdrop-blur-md bg-white/95 border-white/40 ring-1 ring-[#145DA0]/10 hover:shadow-2xl hover:ring-[#145DA0]/20 transition-all duration-300 hover:-translate-y-1 card-soft rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-7 w-7 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-[#145DA0]">CSV + Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="opacity-90">
              Import from device CSV and export professional PDF summaries.
            </CardContent>
          </Card>
          <Card className="group shadow-xl backdrop-blur-md bg-white/95 border-white/40 ring-1 ring-[#145DA0]/10 hover:shadow-2xl hover:ring-[#145DA0]/20 transition-all duration-300 hover:-translate-y-1 card-soft rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <History className="h-7 w-7 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-[#145DA0]"> Session History </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="opacity-90">Secure local storage for past sessions and re-reporting.</CardContent>
          </Card>
        </section>

        {/* Test Protocols Section (Always Visible) */}
        <section className="mt-10" aria-label="Test protocols">
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-[#2E8BC0]/20 to-[#00B8A9]/20 shadow-sm">
            <div className="rounded-2xl bg-white/80 dark:bg-[#1F2F3F]/60 backdrop-blur-sm">
              <Card className="flex flex-col gap-0 p-4 bg-gradient-to-r from-[#2E8BC0]/10 to-[#00B8A9]/10 rounded-lg border border-[#DDEAF1]/50 shadow-none w-full group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2 px-6">
                  <CardTitle className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Shield className="h-8 w-8 text-[var(--color-primary)] shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-bold text-[#145DA0] inline-block text-xl">Test Protocols</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="opacity-90 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center px-4 md:px-6 pb-6">
                  <div>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Tapping the pressure sensor with the fingertip. </li>
                      <li>Try not to pinch or squeeze just normal taps. </li>
                      <li>Tap slowly and deliberately with full-motion.</li>
                      <li>Allow the sensor to fully release between taps</li>
                      <li>Keep the sensor on a stable surface; avoid sliding or twisting during taps.</li>
                      <li>Maintain consistent finger placement throughout the test.</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-3 font-medium">
                      For safety: stop immediately if discomfort occurs. If unsure, ask a clinician before continuing.
                    </p>
                  </div>
                  <div className="w-full bg-black/5 rounded-xl border border-[#DDEAF1] overflow-hidden flex flex-col items-center justify-center p-2">
                    <span className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Device Usage Demonstration</span>
                    <video
                      className="w-full h-auto rounded-lg shadow-sm bg-black"
                      controls
                      preload="metadata"
                      poster="/placeholder-video-poster.jpg"
                    >
                      <source src="/demo.mp4" type="video/mp4" />
                      <p>Your browser does not support HTML video.</p>
                    </video>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-[#DDEAF1] shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00B8A9] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[#145DA0]">System Ready</span>
            </div>
            <div className="w-px h-4 bg-[#DDEAF1]" />
            <span className="text-sm text-gray-500">Integrated Backend</span>
          </div>
        </div>

        {/* Authentication Modal */}
        <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
            <Card className="card-soft rounded-xl border-0 shadow-2xl w-full p-0 gap-0">
              <CardHeader className="bg-gradient-to-r from-[#2E8BC0] to-[#00B8A9] text-white items-stretch leading-7 flex-col gap-0.5 font-bold py-6 justify-center text-center m-0 rounded-t-xl shrink-0">
                <CardTitle className="text-2xl mt-2">
                  {isSignUpMode ? 'Create an Account' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-white/80 font-normal">
                  {isSignUpMode ? 'Sign up to continue your clinical assessments.' : 'Sign in to access patient records and tools.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 bg-white pb-8">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium text-[#145DA0] flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      className="focus-ring bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium text-[#145DA0] flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      className="focus-ring bg-gray-50/50"
                    />
                  </div>

                  {authError && (
                    <p className="text-sm text-red-500 font-medium">{authError}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full btn-bounce min-h-11 bg-gradient-to-r from-[#2E8BC0] to-[var(--color-primary)] hover:opacity-90 shadow-md text-white border-0 mt-4"
                  >
                    {isSignUpMode ? 'Sign Up' : 'Sign In'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#DDEAF1]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground text-[#145DA0] font-medium tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full btn-bounce min-h-11 border-[#DDEAF1] hover:bg-[#F0F6f9] text-[#145DA0] font-medium shadow-sm transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="mt-6 text-center text-sm">
                  <button
                    onClick={() => openAuthModal(!isSignUpMode)}
                    className="text-[var(--color-primary)] hover:underline font-medium hover:text-[#2E8BC0] transition-colors"
                  >
                    {isSignUpMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>

        {/* Nearby Devices Modal */}
        <NearbyDevicesModal
          isOpen={isNearbyOpen}
          onClose={() => setIsNearbyOpen(false)}
          onDeviceSelect={(ip) => {
            setActiveDeviceIp(ip)
          }}
        />
      </main>
    </div>
  )
}
