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

export function useHelipads(aircrafts: Aircraft[]) {
  const [helipads, setHelipads]   = useState<Helipad[]>([])
  const landedRef = useRef<Map<string, Set<string>>>(new Map())

  useEffect(() => {
    const controller = new AbortController()

    fetch('/helipads.json', { signal: controller.signal })
      .then(r => r.json())
      .then((manual: Helipad[]) => setHelipads(manual.map(hp => ({ ...hp, landings: 0 }))))
      .catch(() => {})

    return () => controller.abort()
  }, [])

  // Landing detection: increment counter when a helicopter is near a helipad
  useEffect(() => {
    if (!helipads.length || !aircrafts.length) return

    setHelipads(prev => {
      const next    = [...prev]
      let changed   = false

      prev.forEach((hp, idx) => {
        const key = String(idx)
        if (!landedRef.current.has(key)) landedRef.current.set(key, new Set())
        const seen = landedRef.current.get(key)!

        aircrafts.forEach(ac => {
          if (seen.has(ac.icao_hex)) return
          const altM = ac.altitude != null ? ac.altitude * 0.3048 : null
          if (altM !== null && altM > MAX_ALT_M) return
          const dist = distanceM(ac.lat, ac.lon, hp.lat, hp.lon)
          if (dist <= RADIUS_M) {
            seen.add(ac.icao_hex)
            next[idx] = { ...next[idx], landings: next[idx].landings + 1 }
            changed = true
          }
        })
      })

      return changed ? next : prev
    })
  }, [aircrafts])

  return helipads
}
