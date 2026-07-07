import { useEffect, useRef, useState } from 'react'
import { Helipad } from '../types/helipad'
import { Aircraft } from '../types/aircraft'

const RADIUS_M  = 350
const MAX_ALT_M = 300

// SP capital bounding box (south,west,north,east) for Overpass
const SP_BBOX = '-24.010,-46.826,-23.356,-46.365'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const OVERPASS_QUERY = `[out:json][timeout:30];(node["aeroway"="helipad"](${SP_BBOX});way["aeroway"="helipad"](${SP_BBOX}););out center;`

function distanceM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R  = 6371000
  const dL = ((lat2 - lat1) * Math.PI) / 180
  const dl = ((lon2 - lon1) * Math.PI) / 180
  const a  = Math.sin(dL / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface ManualHelipad {
  name: string; address: string; pousos_permitidos: number
  landings: number; lat: number; lon: number
}

interface OsmElement {
  type: string; id: number
  lat?: number; lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

export function useHelipads(aircrafts: Aircraft[]) {
  const [helipads, setHelipads]   = useState<Helipad[]>([])
  const landedRef = useRef<Map<string, Set<string>>>(new Map())

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      fetch('/helipads.json', { signal: controller.signal }).then(r => r.json() as Promise<ManualHelipad[]>),
      fetch(OVERPASS_URL, {
        method: 'POST',
        body:   OVERPASS_QUERY,
        signal: controller.signal,
      }).then(r => r.json()),
    ]).then(([manual, osm]) => {
      const elements: OsmElement[] = osm.elements ?? []

      const merged: Helipad[] = elements.flatMap(el => {
        const lat = el.lat ?? el.center?.lat
        const lon = el.lon ?? el.center?.lon
        if (!lat || !lon) return []

        const tags    = el.tags ?? {}
        const osmName = tags.name ?? tags.operator ?? `OSM ${el.id}`

        // Match with manual entry by proximity (within 150 m)
        const match = manual.find(m => distanceM(lat, lon, m.lat, m.lon) < 150)

        return [{
          name:              match?.name    ?? osmName,
          address:           match?.address ?? tags['addr:street'] ?? '',
          pousos_permitidos: match?.pousos_permitidos ?? 0,
          landings:          0,
          lat,
          lon,
        }]
      })

      setHelipads(merged)
    }).catch(() => {
      // Overpass unavailable — fall back to manual list
      fetch('/helipads.json').then(r => r.json()).then(setHelipads).catch(() => {})
    })

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
