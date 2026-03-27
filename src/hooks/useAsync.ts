import { useState, useCallback } from 'react'
import { ApiRequestError } from '../lib/api/client'
import type { AsyncState } from '../types/api'

export function useAsync<T>(): AsyncState<T> & {
  execute: (promise: Promise<T>) => Promise<T | null>
  reset: () => void
} {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (promise: Promise<T>): Promise<T | null> => {
    setState({ data: null, loading: true, error: null })
    try {
      const result = await promise
      setState({ data: result, loading: false, error: null })
      return result
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'An unexpected error occurred.'
      setState({ data: null, loading: false, error: message })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}
