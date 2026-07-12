import { useEffect, useState } from 'react'
import { DailyAircraft } from '../types/aircraft'
import { API_BASE } from '../config'
import { isBlockedCallsign } from '../utils/blocklist'

export function useDateAircrafts(date: string) {
  const [aircrafts, setAircrafts] = useState<DailyAircraft[]>([])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    // flag local por execução do efeito — impede que um fetch de uma data
    // anterior (ainda em voo) sobrescreva a lista da data atual
    let cancelled = false

    async function fetchByDate() {
      try {
        const r = await fetch(`${API_BASE}/aircrafts/history?date=${date}`)
        const data = await r.json() as DailyAircraft[]
        const visible = data.filter(ac => !isBlockedCallsign(ac.last_callsign))
        if (!cancelled) setAircrafts(visible)
      } catch {
        if (!cancelled) setAircrafts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setAircrafts([])   // limpa dados da data anterior para não mostrar lista obsoleta
    setLoading(true)
    fetchByDate()

    // repola apenas quando a data selecionada for hoje — dias passados não mudam
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const id = date === today ? setInterval(fetchByDate, 30_000) : undefined

    return () => { cancelled = true; if (id) clearInterval(id) }
  }, [date])

  return { aircrafts, loading }
}
