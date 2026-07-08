import { useEffect, useRef, useState } from 'react'
import { Helipad } from '../types/helipad'
import { Aircraft } from '../types/aircraft'

const RADIUS_M  = 350
const MAX_ALT_M = 300

function distanceM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R  = 6371000
  const dL = ((lat2 - lat1) * Math.PI) / 180
  const dl = ((lon2 - lon1) * Math.PI) / 180
  const a  = Math.sin(dL / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function updateLandings(prev: Helipad[], aircrafts: Aircraft[], landed: Map<string, Set<string>>): Helipad[] {
  const next  = [...prev]
  let changed = false

  prev.forEach((hp, idx) => {
    const key = String(idx)
    if (!landed.has(key)) landed.set(key, new Set())
    const seen = landed.get(key)!

    aircrafts.forEach(ac => {
      if (seen.has(ac.icao_hex)) return
      const altM = ac.altitude != null ? ac.altitude * 0.3048 : null
      if (altM !== null && altM > MAX_ALT_M) return
      if (distanceM(ac.lat, ac.lon, hp.lat, hp.lon) <= RADIUS_M) {
        seen.add(ac.icao_hex)
        next[idx] = { ...next[idx], landings: next[idx].landings + 1 }
        changed = true
      }
    })
  })

  return changed ? next : prev
}

export function useHelipads(aircrafts: Aircraft[]) {
  const [helipads, setHelipads]   = useState<Helipad[]>([])
  const landedRef = useRef<Map<string, Set<string>>>(new Map())

  async function loadHelipads(signal: AbortSignal) {
    try {
      const r = await fetch('/helipads.json', { signal })
      const manual: Helipad[] = await r.json()
      setHelipads(manual.map(hp => ({ ...hp, landings: 0 })))
    } catch {}
  }

  useEffect(() => {
    const controller = new AbortController()
    loadHelipads(controller.signal)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!helipads.length || !aircrafts.length) return
    setHelipads(prev => updateLandings(prev, aircrafts, landedRef.current))
  }, [aircrafts])

  return helipads
}
