import { useEffect, useState } from 'react'
import { DailyAircraft } from './useTodayAircrafts'
import { API_BASE } from '../config'

export function useDateAircrafts(date: string) {
  const [aircrafts, setAircrafts] = useState<DailyAircraft[]>([])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`${API_BASE}/aircrafts/history?date=${date}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setAircrafts(data) })
      .catch(() => { if (!cancelled) setAircrafts([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [date])

  return { aircrafts, loading }
}
