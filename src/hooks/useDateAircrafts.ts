import { useEffect, useRef, useState } from 'react'
import { DailyAircraft } from '../types/aircraft'
import { API_BASE } from '../config'
import { isBlockedCallsign } from '../utils/blocklist'

export function useDateAircrafts(date: string) {
  const [aircrafts, setAircrafts] = useState<DailyAircraft[]>([])
  const [loading, setLoading]     = useState(false)
  const cancelledRef = useRef(false)

  async function fetchByDate() {
    try {
      const r = await fetch(`${API_BASE}/aircrafts/history?date=${date}`)
      const data = await r.json() as DailyAircraft[]
      const visible = data.filter(ac => !isBlockedCallsign(ac.last_callsign))
      if (!cancelledRef.current) setAircrafts(visible)
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

    // repola apenas quando a data selecionada for hoje — dias passados não mudam
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const id = date === today ? setInterval(fetchByDate, 30_000) : undefined

    return () => { cancelledRef.current = true; if (id) clearInterval(id) }
  }, [date])

  return { aircrafts, loading }
}
