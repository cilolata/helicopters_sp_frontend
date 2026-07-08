import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

export function useHistoryRoute(icao: string | null): [number, number][] {
  const [path, setPath] = useState<[number, number][]>([])

  useEffect(() => {
    if (!icao) { setPath([]); return }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    fetch(`${API_BASE}/aircrafts/${icao}/route`, { signal: controller.signal })
      .then(r => r.json())
      .then((data: { lat: number; lon: number }[]) => setPath(data.map(p => [p.lat, p.lon])))
      .catch(() => setPath([]))
      .finally(() => clearTimeout(timer))

    return () => controller.abort()
  }, [icao])

  return path
}
