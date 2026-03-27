import { useState, useEffect, useCallback, useRef } from 'react'
import { getHealth } from '../lib/api/health'
import { ApiRequestError } from '../lib/api/client'
import type { AsyncState, HealthResponse } from '../types/api'

export type BackendStatus = 'checking' | 'online' | 'offline' | 'degraded'

export interface ApiHealthState extends AsyncState<HealthResponse> {
  backendStatus: BackendStatus
  lastChecked: Date | null
  retry: () => void
}

const POLL_INTERVAL_MS = 30_000

export function useApiHealth(pollInterval = POLL_INTERVAL_MS): ApiHealthState {
  const [state, setState] = useState<AsyncState<HealthResponse>>({
    data: null,
    loading: true,
    error: null,
  })
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const check = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await getHealth(controller.signal)
      setBackendStatus(data.status === 'ok' || data.status === 'healthy' ? 'online' : 'degraded')
      setState({ data, loading: false, error: null })
      setLastChecked(new Date())
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const message = err instanceof ApiRequestError
        ? err.message
        : 'Backend unavailable. Please ensure the MQ IntelliMesh API is running.'
      setBackendStatus('offline')
      setState({ data: null, loading: false, error: message })
      setLastChecked(new Date())
    }
  }, [])

  useEffect(() => {
    check()

    if (pollInterval > 0) {
      const timer = setInterval(check, pollInterval)
      return () => {
        clearInterval(timer)
        abortRef.current?.abort()
      }
    }

    return () => {
      abortRef.current?.abort()
    }
  }, [check, pollInterval])

  return { ...state, backendStatus, lastChecked, retry: check }
}
