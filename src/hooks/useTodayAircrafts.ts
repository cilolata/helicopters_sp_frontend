import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

export interface DailyAircraft {
  icao_hex:      string
  last_callsign: string | null
  first_seen:    string
  last_seen:     string
}

const FETCH_TIMEOUT = 8000

export function useTodayAircrafts() {
  const [aircrafts, setAircrafts] = useState<DailyAircraft[]>([])

  useEffect(() => {
    let cancelled = false

    function load() {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
      fetch(`${API_BASE}/aircrafts/today`, { signal: controller.signal })
        .then(r => r.json())
        .then(data => { if (!cancelled) setAircrafts(data) })
        .catch(() => {})
        .finally(() => clearTimeout(timer))
    }

    load()
    const id = setInterval(load, 30_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return aircrafts
}
