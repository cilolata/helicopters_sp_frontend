import { Aircraft } from '../types/aircraft'
import { API_BASE } from '../config'

export async function fetchHelicopters(signal?: AbortSignal): Promise<Aircraft[]> {
  const res = await fetch(`${API_BASE}/aircrafts`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
