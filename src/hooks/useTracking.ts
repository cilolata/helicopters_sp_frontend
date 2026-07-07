import { useState } from 'react'

export function useTracking() {
  const [trackedIcao, setTrackedIcao] = useState<string | null>(null)

  function toggle(icao: string) {
    setTrackedIcao(prev => prev === icao ? null : icao)
  }

  function clear() {
    setTrackedIcao(null)
  }

  return { trackedIcao, toggle, clear }
}
