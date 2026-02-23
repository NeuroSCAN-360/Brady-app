import { createStore, get, set, del, keys } from "idb-keyval"
import type { SamplePoint } from "./csv"
import type { SessionMetrics } from "./metrics"

const store = createStore("fsr-sessions", "sessions")

export type PatientMeta = { name: string; age: number; id?: string; gender?: string; notes?: string }
export type SessionRecord = {
  id: string
  createdAt: number
  patient: PatientMeta
  samples: SamplePoint[]
  metrics: SessionMetrics
  testType: string
}

export async function saveSession(rec: SessionRecord) {
  await set(rec.id, rec, store)
}
export async function getSession(id: string) {
  return get<SessionRecord>(id, store)
}
export async function deleteSession(id: string) {
  return del(id, store)
}

export async function listSessions(): Promise<
  Pick<SessionRecord, "id" | "createdAt" | "patient" | "metrics" | "testType">[]
> {
  const k = await keys(store)
  const list: any[] = []
  for (const key of k) {
    const v = await get<SessionRecord>(key as string, store)
    if (v) list.push({ id: v.id, createdAt: v.createdAt, patient: v.patient, metrics: v.metrics, testType: v.testType })
  }
  return list.sort((a, b) => b.createdAt - a.createdAt)
}
