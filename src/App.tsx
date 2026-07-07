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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [visibleHelipadIndices, setVisibleHelipadIndices] = useState<Set<number>>(new Set())

  function toggleHelipad(idx: number) {
    setVisibleHelipadIndices(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

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

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="md:hidden absolute top-3 right-3 z-1000 bg-gray-900/90 text-white p-2.5 rounded-lg shadow-lg"
          aria-label="Menu"
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <Map
          aircrafts={aircrafts}
          helipads={helipads}
          visibleHelipadIndices={visibleHelipadIndices}
          trackedIcao={trackedIcao}
          trackPath={trackPath}
          historyPath={historyPath}
          onSelect={toggle}
          onDeselect={clear}
          onToggleHelipad={toggleHelipad}
        />
      </div>

      {/* Overlay — mobile only, closes sidebar on tap */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-900"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 right-0 z-950
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <HelicopterList
          aircrafts={aircrafts}
          helipads={helipads}
          trackedIcao={trackedIcao}
          historyIcao={historyIcao}
          visibleHelipadIndices={visibleHelipadIndices}
          onSelect={toggle}
          onShowHistory={handleShowHistory}
          onToggleHelipad={toggleHelipad}
        />
      </div>
    </div>
  )
}
