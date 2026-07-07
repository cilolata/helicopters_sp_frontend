import React from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { Helipad } from '../../types/helipad'

function makeHelipadIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize:  [20, 20],
    iconAnchor:[10, 10],
    html: `<div style="
      width:20px;height:20px;background:#1b5e20;
      border:1.5px solid rgba(0,0,0,0.35);border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:900;font-size:11px;color:#fff;font-family:sans-serif;
      box-shadow:0 1px 4px rgba(0,0,0,0.45);">H</div>`,
  })
}

interface HelipadMarkerProps {
  hp:     Helipad
  onHide: () => void
}

export function HelipadMarker({ hp, onHide }: HelipadMarkerProps) {
  return (
    <Marker
      position={[hp.lat, hp.lon]}
      icon={makeHelipadIcon()}
      eventHandlers={{ click: onHide }}
    />
  )
}
