import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AnalyzeResponse } from '../types/api'

export type AnalysisStatus = 'idle' | 'running' | 'success' | 'error'

export interface AnalysisState {
  status: AnalysisStatus
  result: AnalyzeResponse | null
  error: string | null
  analyzedAt: Date | null
}

interface AnalysisContextValue extends AnalysisState {
  setRunning: () => void
  setSuccess: (result: AnalyzeResponse) => void
  setError: (message: string) => void
  reset: () => void
  isAnalyzed: boolean
  criticalCount: number
  highCount: number
  totalFindings: number
  healthScore: number
}

const initial: AnalysisState = {
  status: 'idle',
  result: null,
  error: null,
  analyzedAt: null,
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>(initial)

  const setRunning = useCallback(() => {
    setState({ ...initial, status: 'running' })
  }, [])

  const setSuccess = useCallback((result: AnalyzeResponse) => {
    setState({ status: 'success', result, error: null, analyzedAt: new Date() })
  }, [])

  const setError = useCallback((message: string) => {
    setState(prev => ({ ...prev, status: 'error', error: message }))
  }, [])

  const reset = useCallback(() => setState(initial), [])

  const isAnalyzed = state.status === 'success' && state.result !== null
  const criticalCount = state.result?.summary?.severity_breakdown?.critical ?? 0
  const highCount = state.result?.summary?.severity_breakdown?.high ?? 0
  const totalFindings = state.result?.summary?.total_findings ?? 0
  const healthScore = state.result?.health?.score ?? 0

  return (
    <AnalysisContext.Provider
      value={{ ...state, setRunning, setSuccess, setError, reset, isAnalyzed, criticalCount, highCount, totalFindings, healthScore }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used inside <AnalysisProvider>')
  return ctx
}
