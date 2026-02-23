"use client"

export default function AnimatedBackground() {
  // Fixed, low-contrast animated grid. Pointer events disabled to avoid blocking UI.
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="animated-clinical-grid" />
    </div>
  )
}
