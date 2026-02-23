"use client"
import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, Brush } from "recharts"
import type { SamplePoint } from "@/lib/csv"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { samples: SamplePoint[]; title?: string }

export function LiveChart({ samples, title = "Pressure vs Time" }: Props) {
  const data = useMemo(() => {
    if (!samples.length) return []
    const MAX_POINTS = 5000
    const t0 = samples[0].t
    const src = samples
    let decimated: typeof src = src
    if (src.length > MAX_POINTS) {
      const bucketCount = Math.max(1, Math.floor(MAX_POINTS / 2))
      const bucketSize = Math.ceil(src.length / bucketCount)
      const out: typeof src = []
      let lastIdx = -1

      const pushIdx = (idx: number) => {
        if (idx <= lastIdx) return
        out.push(src[idx])
        lastIdx = idx
      }

      pushIdx(0)
      for (let start = 0; start < src.length; start += bucketSize) {
        const end = Math.min(src.length, start + bucketSize)
        if (end - start <= 0) continue

        let minI = start
        let maxI = start
        for (let i = start; i < end; i++) {
          const f = src[i].force
          if (f < src[minI].force) minI = i
          if (f > src[maxI].force) maxI = i
        }

        if (minI === maxI) {
          pushIdx(minI)
        } else if (minI < maxI) {
          pushIdx(minI)
          pushIdx(maxI)
        } else {
          pushIdx(maxI)
          pushIdx(minI)
        }
      }
      pushIdx(src.length - 1)
      decimated = out
    }
    return decimated.map((s) => ({ t: (s.t - t0) / 1000, force: s.force }))
  }, [samples])

  return (
    <Card className="card-soft rounded-xl">
      <CardHeader>
        <CardTitle className="text-pretty">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) => `${v}s`}
            />
            <YAxis
              type="number"
              domain={[0, (max: number) => (Number.isFinite(max) ? Math.max(1, max * 1.1) : 1)]}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)" }}
              formatter={(val, name) => [String(val), name === "force" ? "Force (N)" : String(name)]}
              labelFormatter={(v) => `Time: ${v}s`}
            />
            <Legend />
            <Line
              type="linear"
              dataKey="force"
              name="Force (N)"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Brush dataKey="t" height={20} travellerWidth={10} stroke="var(--color-secondary)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
