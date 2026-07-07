import React from 'react'
import { Aircraft } from '../../types/aircraft'
import { fmt } from '../../utils/format'

export function AircraftPopup({ ac }: { ac: Aircraft }) {
  const time = new Date(ac.captured_at).toLocaleTimeString('pt-BR')
  return (
    <div className="text-sm leading-7 min-w-40">
      <strong className="text-base">{ac.icao_hex}</strong>
      <span className="ml-1.5 text-xs text-gray-500">🚁 Helicóptero</span><br />
      <b>Callsign:</b> {ac.callsign ?? '—'}<br />
      <b>Altitude:</b> {fmt(ac.altitude, 'ft')}<br />
      <b>Velocidade:</b> {fmt(ac.ground_speed, 'kt')}<br />
      <b>Track:</b> {fmt(ac.track, '°')}<br />
      <b>Vert. rate:</b> {fmt(ac.vert_rate, 'ft/min')}<br />
      <b>Último sinal:</b> {time}
    </div>
  )
}
