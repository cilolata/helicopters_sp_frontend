import React from 'react'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
// @ts-ignore: CSS import declaration not available in this project
import 'leaflet/dist/leaflet.css'
import { Aircraft } from '../../types/aircraft'
import { Helipad } from '../../types/helipad'
import { AircraftMarker } from './AircraftMarker'
import { HelipadMarker } from './HelipadMarker'
import { MapAutoFit, MapTracker, MapClickDeselect } from './MapControls'

interface Props {
  aircrafts:             Aircraft[]
  helipads:              Helipad[]
  visibleHelipadIndices: Set<number>
  trackedIcao:           string | null
  trackPath:             [number, number][]
  historyPath:           [number, number][]
  onSelect:              (icao: string) => void
  onDeselect:            () => void
  onToggleHelipad:       (idx: number) => void
}

export function Map({ aircrafts, helipads, visibleHelipadIndices, trackedIcao, trackPath, historyPath, onSelect, onDeselect, onToggleHelipad }: Props) {
  return (
    <MapContainer
      center={[-23.5505, -46.6333]}
      zoom={10}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapAutoFit aircrafts={aircrafts} />
      <MapTracker aircrafts={aircrafts} trackedIcao={trackedIcao} />
      <MapClickDeselect onDeselect={onDeselect} />
      {historyPath.length > 1 && (
        <>
          <Polyline positions={historyPath} pathOptions={{ color: '#000', weight: 7, opacity: 0.5, dashArray: '10 6' }} />
          <Polyline positions={historyPath} pathOptions={{ color: '#39ff14', weight: 3, opacity: 0.85, dashArray: '10 6' }} />
        </>
      )}
      {trackPath.length > 1 && (
        <>
          <Polyline positions={trackPath} pathOptions={{ color: '#000', weight: 8, opacity: 0.55 }} />
          <Polyline positions={trackPath} pathOptions={{ color: '#39ff14', weight: 4, opacity: 1 }} />
        </>
      )}
      {helipads.map((hp, i) =>
        visibleHelipadIndices.has(i) ? (
          <HelipadMarker key={i} hp={hp} onHide={() => onToggleHelipad(i)} />
        ) : null
      )}
      {aircrafts.map(ac => (
        <AircraftMarker
          key={ac.icao_hex}
          ac={ac}
          tracked={trackedIcao === ac.icao_hex}
          onSelect={() => onSelect(ac.icao_hex)}
        />
      ))}
    </MapContainer>
  )
}
