import { useEffect, useRef, useState } from 'react'
import { Aircraft } from '../types/aircraft'
import { fetchHelicopters } from '../services/aircraft.service'

const POLL_INTERVAL = 5000
const FETCH_TIMEOUT = 8000

export function useAircrafts() {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([])
  const [error, setError]         = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const cancelledRef  = useRef(false)

  async function poll() {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    try {
      const data = await fetchHelicopters(controller.signal)
      if (!cancelledRef.current) { setAircrafts(data); setError(null) }
    } catch (err: any) {
      if (!cancelledRef.current && err?.name !== 'AbortError') setError('Erro ao carregar dados')
    } finally {
      clearTimeout(timer)
    }
  }

  useEffect(() => {
    cancelledRef.current = false
    poll()
    const id = setInterval(poll, POLL_INTERVAL)
    return () => {
      cancelledRef.current = true
      clearInterval(id)
      controllerRef.current?.abort()
    }
  }, [])

  return { aircrafts, error }
}
