import React from 'react'
import { Aircraft } from '../../types/aircraft'

interface Props {
  aircrafts:   Aircraft[]
  error:       string | null
  trackedIcao: string | null
}

export function StatusBar({ aircrafts, error, trackedIcao }: Props) {
  const base = 'fixed top-3 right-3 z-[1000] rounded-lg px-4 py-2 text-sm text-white font-sans pointer-events-none leading-7'

  if (error) return (
    <div className={`${base} bg-red-700/90`}>{error}</div>
  )

  const tracked = trackedIcao ? aircrafts.find(a => a.icao_hex === trackedIcao) : null

  return (
    <div className={`${base} bg-black/70`}>
      {aircrafts.length === 0
        ? <div>Nenhum helicóptero detectado</div>
        : <div>🚁 {aircrafts.length} helicóptero{aircrafts.length > 1 ? 's' : ''}</div>
      }
      {tracked && (
        <div className="mt-1.5 pt-1.5 border-t border-white/25 text-xs">
          📍 Seguindo <b>{tracked.callsign ?? tracked.icao_hex}</b><br />
          {tracked.model && <>{tracked.model} · </>}
          {tracked.altitude     != null && <>{tracked.altitude} ft · </>}
          {tracked.ground_speed != null && <>{tracked.ground_speed} kt</>}
          {tracked.owner && <><br />{tracked.owner}</>}
        </div>
      )}
    </div>
  )
}
