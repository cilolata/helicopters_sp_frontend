import { useEffect, useRef, useState } from 'react'
import { Aircraft } from '../types/aircraft'
import { API_BASE } from '../config'

function appendPosition(prev: [number, number][], lat: number, lon: number): [number, number][] {
  const last = prev[prev.length - 1]
  if (last && last[0] === lat && last[1] === lon) return prev
  const next = [...prev, [lat, lon] as [number, number]]
  return next.length > 2000 ? next.slice(-2000) : next
}

export function useTrackPath(aircrafts: Aircraft[], trackedIcao: string | null) {
  const [path, setPath]  = useState<[number, number][]>([])
  const prevTracked      = useRef<string | null>(null)
  const cancelledRef     = useRef(false)

  async function loadRoute(signal: AbortSignal) {
    try {
      const r = await fetch(`${API_BASE}/aircrafts/${trackedIcao}/route`, { signal })
      const data: { lat: number; lon: number }[] = await r.json()
      if (!cancelledRef.current) setPath(data.map(p => [p.lat, p.lon] as [number, number]))
    } catch {
      if (!cancelledRef.current) setPath([])
    }
  }

  // Load historical route when a new aircraft is selected
  useEffect(() => {
    if (!trackedIcao) {
      setPath([])
      prevTracked.current = null
      return
    }
    if (prevTracked.current === trackedIcao) return
    prevTracked.current = trackedIcao

    cancelledRef.current = false
    const controller = new AbortController()

    loadRoute(controller.signal)
    return () => { cancelledRef.current = true; controller.abort() }
  }, [trackedIcao])

  // Append live positions as polls arrive (cap at 2000 points)
  useEffect(() => {
    if (!trackedIcao) return
    const ac = aircrafts.find(a => a.icao_hex === trackedIcao)
    if (!ac) return
    setPath(prev => appendPosition(prev, ac.lat, ac.lon))
  }, [aircrafts, trackedIcao])

  return path
}
