import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

export interface DailyAircraft {
  icao_hex:      string
  last_callsign: string | null
  first_seen:    string
  last_seen:     string
}

export function useTodayAircrafts() {
  const [aircrafts, setAircrafts] = useState<DailyAircraft[]>([])

  useEffect(() => {
    function load() {
      fetch(`${API_BASE}/aircrafts/today`)
        .then(r => r.json())
        .then(setAircrafts)
        .catch(console.error)
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  return aircrafts
}
