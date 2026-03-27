import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { IngestResponse } from '../types/api'

export type IngestStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

export interface IngestState {
  status: IngestStatus
  result: IngestResponse | null
  error: string | null
  ingestedAt: Date | null
  datasetId: string | null
}

interface IngestContextValue extends IngestState {
  setUploading: () => void
  setProcessing: () => void
  setSuccess: (result: IngestResponse) => void
  setError: (message: string) => void
  reset: () => void
  isReady: boolean
}

const initialState: IngestState = {
  status: 'idle',
  result: null,
  error: null,
  ingestedAt: null,
  datasetId: null,
}

const IngestContext = createContext<IngestContextValue | null>(null)

export function IngestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IngestState>(initialState)

  const setUploading = useCallback(() => {
    setState({ ...initialState, status: 'uploading' })
  }, [])

  const setProcessing = useCallback(() => {
    setState(prev => ({ ...prev, status: 'processing' }))
  }, [])

  const setSuccess = useCallback((result: IngestResponse) => {
    setState({
      status: 'success',
      result,
      error: null,
      ingestedAt: new Date(),
      datasetId: result.dataset_id ?? null,
    })
  }, [])

  const setError = useCallback((message: string) => {
    setState(prev => ({ ...prev, status: 'error', error: message }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const isReady = state.status === 'success' && state.result !== null

  return (
    <IngestContext.Provider value={{ ...state, setUploading, setProcessing, setSuccess, setError, reset, isReady }}>
      {children}
    </IngestContext.Provider>
  )
}

export function useIngest(): IngestContextValue {
  const ctx = useContext(IngestContext)
  if (!ctx) throw new Error('useIngest must be used inside <IngestProvider>')
  return ctx
}
