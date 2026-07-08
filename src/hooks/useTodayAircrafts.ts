import { useEffect, useRef, useState } from 'react'
import { DailyAircraft } from '../types/aircraft'
import { API_BASE } from '../config'

const FETCH_TIMEOUT = 8000

export function useTodayAircrafts() {
  const [aircrafts, setAircrafts] = useState<DailyAircraft[]>([])
  const cancelledRef = useRef(false)

  async function load() {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    try {
      const r = await fetch(`${API_BASE}/aircrafts/today`, { signal: controller.signal })
      const data = await r.json()
      if (!cancelledRef.current) setAircrafts(data)
    } catch {}
    finally {
      clearTimeout(timer)
    }
  }

  useEffect(() => {
    cancelledRef.current = false
    load()
    const id = setInterval(load, 30_000)
    return () => { cancelledRef.current = true; clearInterval(id) }
  }, [])

  return aircrafts
}
