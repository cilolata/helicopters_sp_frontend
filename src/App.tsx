import React, { useEffect, useState } from 'react'
import { Map } from './components/Map/Map'
import { HelicopterList } from './components/Sidebar/HelicopterList'
import { useAircrafts } from './hooks/useAircrafts'
import { useTracking } from './hooks/useTracking'
import { useTrackPath } from './hooks/useTrackPath'
import { useHelipads } from './hooks/useHelipads'
import { useHistoryRoute } from './hooks/useHistoryRoute'

export default function App() {
  const { aircrafts, error } = useAircrafts()
  const { trackedIcao, toggle, clear } = useTracking()
  const trackPath  = useTrackPath(aircrafts, trackedIcao)
  const helipads   = useHelipads(aircrafts)

  const [historyIcao, setHistoryIcao] = useState<string | null>(null)
  const historyPath = useHistoryRoute(historyIcao)

  // When the tracked aircraft disappears from the live feed, clear tracking + path
  useEffect(() => {
    if (!trackedIcao) return
    if (!aircrafts.some(a => a.icao_hex === trackedIcao)) clear()
  }, [aircrafts, trackedIcao])

  function handleShowHistory(icao: string) {
    setHistoryIcao(prev => prev === icao ? null : icao)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1 relative">
        {error && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-1000 bg-red-700/90 text-white text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        <Map
          aircrafts={aircrafts}
          helipads={helipads}
          trackedIcao={trackedIcao}
          trackPath={trackPath}
          historyPath={historyPath}
          onSelect={toggle}
          onDeselect={clear}
        />
      </div>
      <HelicopterList
        aircrafts={aircrafts}
        helipads={helipads}
        trackedIcao={trackedIcao}
        historyIcao={historyIcao}
        onSelect={toggle}
        onShowHistory={handleShowHistory}
      />
    </div>
  )
}
