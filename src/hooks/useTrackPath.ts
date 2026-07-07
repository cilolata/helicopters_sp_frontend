import { useEffect, useRef, useState } from 'react'
import { Aircraft } from '../types/aircraft'
import { API_BASE } from '../config'

export function useTrackPath(aircrafts: Aircraft[], trackedIcao: string | null) {
  const [path, setPath] = useState<[number, number][]>([])
  const prevTracked = useRef<string | null>(null)

  // When a new aircraft is selected, load its full historical route from the DB
  useEffect(() => {
    if (!trackedIcao) {
      setPath([])
      prevTracked.current = null
      return
    }
    if (prevTracked.current === trackedIcao) return
    prevTracked.current = trackedIcao

    fetch(`${API_BASE}/aircrafts/${trackedIcao}/route`)
      .then(r => r.json())
      .then((data: { lat: number; lon: number }[]) => {
        setPath(data.map(p => [p.lat, p.lon] as [number, number]))
      })
      .catch(() => setPath([]))
  }, [trackedIcao])

  // Append each new position as live polls arrive
  useEffect(() => {
    if (!trackedIcao) return
    const ac = aircrafts.find(a => a.icao_hex === trackedIcao)
    if (!ac) return
    setPath(prev => {
      const last = prev[prev.length - 1]
      if (last && last[0] === ac.lat && last[1] === ac.lon) return prev
      return [...prev, [ac.lat, ac.lon]]
    })
  }, [aircrafts, trackedIcao])

  return path
}
