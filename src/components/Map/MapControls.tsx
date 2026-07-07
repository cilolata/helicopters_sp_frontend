import { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { Aircraft } from '../../types/aircraft'

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
