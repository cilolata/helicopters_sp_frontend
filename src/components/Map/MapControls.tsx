import { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { Aircraft } from '../../types/aircraft'

const CITY_VIEW = {
  SP: { center: [-23.5505, -46.6333] as [number, number], zoom: 10 },
  RJ: { center: [-22.9068, -43.1729] as [number, number], zoom: 11 },
}

export function MapCityFocus({ city }: { city: 'SP' | 'RJ' }) {
  const map = useMap()
  useEffect(() => {
    const { center, zoom } = CITY_VIEW[city]
    map.flyTo(center, zoom, { animate: true, duration: 1.2 })
  }, [city])
  return null
}

export function MapAutoFit({ aircrafts }: { aircrafts: Aircraft[] }) {
  const map    = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current || aircrafts.length === 0) return
    map.fitBounds(
      aircrafts.map(ac => [ac.lat, ac.lon] as [number, number]),
      { maxZoom: 11, padding: [60, 60] }
    )
    fitted.current = true
  }, [aircrafts])

  return null
}

export function MapClickDeselect({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({ click: onDeselect })
  return null
}

export function MapTracker({ aircrafts, trackedIcao }: { aircrafts: Aircraft[]; trackedIcao: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (!trackedIcao) return
    const ac = aircrafts.find(a => a.icao_hex === trackedIcao)
    if (ac) map.panTo([ac.lat, ac.lon], { animate: true, duration: 0.8 })
  }, [aircrafts, trackedIcao])

  return null
}
