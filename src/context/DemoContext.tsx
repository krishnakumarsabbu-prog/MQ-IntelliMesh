import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface DemoContextValue {
  ceoMode: boolean
  toggleCeoMode: () => void
  setCeoMode: (value: boolean) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [ceoMode, setCeoModeState] = useState(false)

  const toggleCeoMode = useCallback(() => {
    setCeoModeState(v => !v)
  }, [])

  const setCeoMode = useCallback((value: boolean) => {
    setCeoModeState(value)
  }, [])

  return (
    <DemoContext.Provider value={{ ceoMode, toggleCeoMode, setCeoMode }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>')
  return ctx
}
