import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

export function useHistoryRoute(icao: string | null): [number, number][] {
  const [path, setPath] = useState<[number, number][]>([])

  async function fetchRoute(signal: AbortSignal) {
    try {
      const r = await fetch(`${API_BASE}/aircrafts/${icao}/route`, { signal })
      const data: { lat: number; lon: number }[] = await r.json()
      setPath(data.map(p => [p.lat, p.lon]))
    } catch {
      setPath([])
    }
  }

  useEffect(() => {
    if (!icao) { setPath([]); return }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    fetchRoute(controller.signal).finally(() => clearTimeout(timer))
    return () => controller.abort()
  }, [icao])

  return path
}
