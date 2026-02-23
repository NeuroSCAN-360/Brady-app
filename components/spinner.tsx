type SpinnerProps = {
  label?: string
  size?: number // in px
}

export function Spinner({ label = "Loading…", size = 48 }: SpinnerProps) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3">
      {/* Visual spinner */}
      <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
        {/* Base ring */}
        <div className="absolute inset-0 rounded-full border-[6px] border-[var(--color-secondary)] opacity-25" />
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-[6px] border-[var(--color-primary)] border-t-transparent motion-safe:animate-spin" />
      </div>
      {/* Screen reader label */}
      <span className="sr-only">{label}</span>
    </div>
  )
}
