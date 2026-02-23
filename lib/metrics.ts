import type { SamplePoint } from "./csv"

export type SessionMetrics = {
  avgForce: number
  maxForce: number
  tapFrequencyHz: number
  variability: number
  durationMs: number
}

export function computeMetrics(samples: SamplePoint[]): SessionMetrics {
  if (!samples.length) return { avgForce: 0, maxForce: 0, tapFrequencyHz: 0, variability: 0, durationMs: 0 }
  const forces = samples.map((s) => s.force)
  
  // Calculate average force excluding zero values (only count actual taps)
  const nonZeroForces = forces.filter((f) => f > 0)
  const avgForce = nonZeroForces.length > 0 
    ? nonZeroForces.reduce((a, b) => a + b, 0) / nonZeroForces.length 
    : 0
  
  const maxForce = Math.max(...forces)
  const variability = stddev(forces)
  const durationMs = samples[samples.length - 1].t - samples[0].t
  const tapFrequencyHz = estimateTapFrequency(samples)
  return { avgForce, maxForce, tapFrequencyHz, variability, durationMs }
}

function stddev(v: number[]) {
  const m = v.reduce((a, b) => a + b, 0) / v.length
  const variance = v.reduce((a, x) => a + (x - m) ** 2, 0) / v.length
  return Math.sqrt(variance)
}

function estimateTapFrequency(samples: SamplePoint[]) {
  const forces = samples.map((s) => s.force)
  const mean = forces.reduce((a, b) => a + b, 0) / forces.length
  const sd = stddev(forces)
  const thr = mean + 0.5 * sd
  const peaks: number[] = []
  for (let i = 1; i < samples.length - 1; i++) {
    const s = samples[i]
    if (s.force > thr && s.force >= samples[i - 1].force && s.force >= samples[i + 1].force) {
      if (!peaks.length || s.t - peaks[peaks.length - 1] > 80) peaks.push(s.t)
    }
  }
  if (peaks.length < 2) return 0
  const intervals: number[] = []
  for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1])
  const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return avgMs > 0 ? 1000 / avgMs : 0
}
