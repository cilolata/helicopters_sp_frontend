import React, { useEffect, useRef } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Aircraft } from '../../types/aircraft'
import { makeHelicopterIcon } from '../../utils/markerIcon'
import { lerp } from '../../utils/format'
import { AircraftPopup } from './AircraftPopup'

const POLL_MS = 5000

function startLerp(
  marker: L.Marker,
  from: [number, number],
  to: [number, number],
  frameRef: React.MutableRefObject<number | undefined>,
): void {
  const start = performance.now()
  function step(now: number) {
    const t = Math.min((now - start) / POLL_MS, 1)
    marker.setLatLng([lerp(from[0], to[0], t), lerp(from[1], to[1], t)])
    if (t < 1) frameRef.current = requestAnimationFrame(step)
  }
  frameRef.current = requestAnimationFrame(step)
}

interface Props {
  ac:       Aircraft
  tracked:  boolean
  onSelect: () => void
}

export function AircraftMarker({ ac, tracked, onSelect }: Props) {
  const markerRef  = useRef<L.Marker>(null)
  const prevPos    = useRef<[number, number]>([ac.lat, ac.lon])
  const frameRef   = useRef<number>()
  // Stable ref so react-leaflet never fights the lerp animation via prop updates
  const stablePos  = useRef<[number, number]>([ac.lat, ac.lon])

  // Smooth position lerp between polls
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    const from = prevPos.current
    const to: [number, number] = [ac.lat, ac.lon]
    prevPos.current = to
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    if (from[0] === to[0] && from[1] === to[1]) return
    startLerp(marker, from, to, frameRef)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [ac.lat, ac.lon])

  // Recreate icon whenever heading or tracked state changes.
  // track is baked into the HTML so the heading is correct from the first render.
  useEffect(() => {
    markerRef.current?.setIcon(makeHelicopterIcon(tracked, ac.track ?? 0))
  }, [tracked, ac.track])

  return (
    <Marker
      ref={markerRef}
      position={stablePos.current}
      icon={makeHelicopterIcon(tracked, ac.track ?? 0)}
      eventHandlers={{ click: onSelect }}
    >
      <Popup><AircraftPopup ac={ac} /></Popup>
    </Marker>
  )
}
