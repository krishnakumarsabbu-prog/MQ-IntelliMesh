import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { ExportResponse } from '../types/api'

export type ExportStatus = 'idle' | 'generating' | 'success' | 'error'

export interface ExportState {
  status: ExportStatus
  result: ExportResponse | null
  error: string | null
  exportedAt: Date | null
}

interface ExportContextValue extends ExportState {
  setGenerating: () => void
  setSuccess: (result: ExportResponse) => void
  setError: (message: string) => void
  reset: () => void
  isExported: boolean
  artifactCount: number
  exportId: string | null
}

const initial: ExportState = {
  status: 'idle',
  result: null,
  error: null,
  exportedAt: null,
}

const ExportContext = createContext<ExportContextValue | null>(null)

export function ExportProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExportState>(initial)

  const setGenerating = useCallback(() => {
    setState({ ...initial, status: 'generating' })
  }, [])

  const setSuccess = useCallback((result: ExportResponse) => {
    setState({ status: 'success', result, error: null, exportedAt: new Date() })
  }, [])

  const setError = useCallback((message: string) => {
    setState(prev => ({ ...prev, status: 'error', error: message }))
  }, [])

  const reset = useCallback(() => setState(initial), [])

  const isExported = state.status === 'success' && state.result !== null
  const artifactCount = state.result?.artifact_count ?? 0
  const exportId = state.result?.export_id ?? null

  return (
    <ExportContext.Provider
      value={{ ...state, setGenerating, setSuccess, setError, reset, isExported, artifactCount, exportId }}
    >
      {children}
    </ExportContext.Provider>
  )
}

export function useExport(): ExportContextValue {
  const ctx = useContext(ExportContext)
  if (!ctx) throw new Error('useExport must be used inside <ExportProvider>')
  return ctx
}
