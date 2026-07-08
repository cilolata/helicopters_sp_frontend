import { useEffect, useRef, useState } from 'react'
import { DailyAircraft } from '../types/aircraft'
import { API_BASE } from '../config'

export function useDateAircrafts(date: string) {
  const [aircrafts, setAircrafts] = useState<DailyAircraft[]>([])
  const [loading, setLoading]     = useState(false)
  const cancelledRef = useRef(false)

  async function fetchByDate() {
    try {
      const r = await fetch(`${API_BASE}/aircrafts/history?date=${date}`)
      const data = await r.json()
      if (!cancelledRef.current) setAircrafts(data)
    } catch {
      if (!cancelledRef.current) setAircrafts([])
    } finally {
      if (!cancelledRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    cancelledRef.current = false
    setLoading(true)
    fetchByDate()
    return () => { cancelledRef.current = true }
  }, [date])

  return { aircrafts, loading }
}
