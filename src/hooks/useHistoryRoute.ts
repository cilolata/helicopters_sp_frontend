import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

export function useHistoryRoute(icao: string | null): [number, number][] {
  const [path, setPath] = useState<[number, number][]>([])

  useEffect(() => {
    if (!icao) { setPath([]); return }

    let cancelled = false
    fetch(`${API_BASE}/aircrafts/${icao}/route`)
      .then(r => r.json())
      .then((data: { lat: number; lon: number }[]) => {
        if (!cancelled) setPath(data.map(p => [p.lat, p.lon]))
      })
      .catch(() => { if (!cancelled) setPath([]) })

    return () => { cancelled = true }
  }, [icao])

  return path
}
