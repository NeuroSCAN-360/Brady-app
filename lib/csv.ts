export type CSVRow = Record<string, string>
export type SamplePoint = { t: number; force: number; finger?: string }

export function parseCSV(text: string): { headers: string[]; rows: CSVRow[] } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return { headers: [], rows: [] }
  const headers = splitCSVLine(lines[0])
  const rows: CSVRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i])
    const row: CSVRow = {}
    headers.forEach((h, idx) => (row[h] = values[idx] ?? ""))
    rows.push(row)
  }
  return { headers, rows }
}

function splitCSVLine(line: string): string[] {
  const out: string[] = []
  let cur = "",
    inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQ = !inQ
      }
    } else if (c === "," && !inQ) {
      out.push(cur)
      cur = ""
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function rowsToSamples(rows: CSVRow[]): SamplePoint[] {
  function normalizeKey(k: string): string {
    return k.toLowerCase().replace(/[^a-z0-9]/g, "")
  }
  return rows
    .map((r) => {
      // Build a normalized view of the row keys
      const norm: Record<string, string> = {}
      for (const [k, v] of Object.entries(r)) {
        norm[normalizeKey(k)] = v
      }
      const tStr =
        norm["timems"] ??
        norm["time"] ??
        norm["t"] ??
        norm["timestamp"] ??
        norm["ms"] ??
        "0"
      const fStr =
        norm["forcen"] ??
        norm["force"] ??
        norm["pressure"] ??
        norm["value"] ??
        norm["n"] ??
        "0"
      const finger = r.finger ?? r.channel ?? r["Finger"] ?? undefined
      const t = Number.parseFloat(tStr)
      const force = Number.parseFloat(fStr)
      return { t, force, finger }
    })
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.force))
}
