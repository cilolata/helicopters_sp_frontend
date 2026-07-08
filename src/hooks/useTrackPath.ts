import { useEffect, useRef, useState } from 'react'
import { Aircraft } from '../types/aircraft'
import { API_BASE } from '../config'

export function useTrackPath(aircrafts: Aircraft[], trackedIcao: string | null) {
  const [path, setPath] = useState<[number, number][]>([])
  const prevTracked = useRef<string | null>(null)

  // Load historical route when a new aircraft is selected
  useEffect(() => {
    if (!trackedIcao) {
      setPath([])
      prevTracked.current = null
      return
    }
    if (prevTracked.current === trackedIcao) return
    prevTracked.current = trackedIcao

    let cancelled = false
    const controller = new AbortController()

    fetch(`${API_BASE}/aircrafts/${trackedIcao}/route`, { signal: controller.signal })
      .then(r => r.json())
      .then((data: { lat: number; lon: number }[]) => {
        if (!cancelled) setPath(data.map(p => [p.lat, p.lon] as [number, number]))
      })
      .catch(() => { if (!cancelled) setPath([]) })

    return () => { cancelled = true; controller.abort() }
  }, [trackedIcao])

  // Append live positions as polls arrive (cap at 2000 points)
  useEffect(() => {
    if (!trackedIcao) return
    const ac = aircrafts.find(a => a.icao_hex === trackedIcao)
    if (!ac) return
    setPath(prev => {
      const last = prev[prev.length - 1]
      if (last && last[0] === ac.lat && last[1] === ac.lon) return prev
      const next = [...prev, [ac.lat, ac.lon] as [number, number]]
      return next.length > 2000 ? next.slice(-2000) : next
    })
  }, [aircrafts, trackedIcao])

  return path
}
