import { useEffect, useState } from 'react'
import { Aircraft } from '../types/aircraft'
import { fetchHelicopters } from '../services/aircraft.service'

const POLL_INTERVAL = 5000

export function useAircrafts() {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([])
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    async function poll() {
      try {
        setAircrafts(await fetchHelicopters())
        setError(null)
      } catch {
        setError('Erro ao carregar dados')
      }
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return { aircrafts, error }
}
