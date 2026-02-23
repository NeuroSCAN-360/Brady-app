import { Spinner } from "@/components/spinner"

export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="flex flex-col items-center text-center gap-4">
        <Spinner label="Loading session…" size={72} />
        <p className="text-sm text-muted-foreground">Preparing session data. This may take a few moments…</p>
      </div>
    </div>
  )
}
