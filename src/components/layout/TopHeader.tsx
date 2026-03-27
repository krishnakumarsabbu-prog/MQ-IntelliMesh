import { useLocation } from 'react-router-dom'
import { Search, Bell, HelpCircle, Cpu, ChevronDown, Activity, WifiOff, Loader2, Presentation, MonitorPlay } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApiHealth } from '../../hooks/useApiHealth'
import { useDemo } from '../../context/DemoContext'
import type { BackendStatus } from '../../hooks/useApiHealth'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Command Center', subtitle: 'AI Transformation Intelligence — Platform Overview' },
  '/topology': { title: 'As-Is Topology', subtitle: 'MQ Estate Discovery — Structural Analysis View' },
  '/findings': { title: 'Findings & Risk', subtitle: 'Anomaly Detection — Policy Violations & Structural Risk' },
  '/planner': { title: 'Transformation Planner', subtitle: 'Guided Topology Simplification Workflow' },
  '/target-state': { title: 'Target State Architecture', subtitle: 'Validated Target-State Design — Before / After View' },
  '/complexity-lab': { title: 'Complexity Intelligence Lab', subtitle: 'MTCS Scoring — Structural Metrics & Reduction Analysis' },
  '/explainability': { title: 'AI Explainability', subtitle: 'Decision Transparency — Reasoning & Audit Trail' },
  '/exports': { title: 'Automation Delivery Center', subtitle: 'Export Engine — Provisioning-Ready Artifact Packages' },
}

function BackendIndicator({ status, onRetry }: { status: BackendStatus; onRetry: () => void }) {
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700/40 border border-slate-700/50">
        <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
        <span className="text-[11px] font-medium text-slate-400 hidden sm:block">Connecting…</span>
      </div>
    )
  }

  if (status === 'online') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20" title="Backend API online">
        <Activity className="w-3 h-3 text-emerald-400" />
        <span className="text-[11px] font-medium text-emerald-400 hidden sm:block">API Online</span>
      </div>
    )
  }

  if (status === 'degraded') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/20" title="Backend API degraded">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-medium text-amber-400 hidden sm:block">Degraded</span>
      </div>
    )
  }

  return (
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/8 border border-rose-500/20 hover:bg-rose-500/15 transition-colors"
      title="Backend offline — click to retry"
    >
      <WifiOff className="w-3 h-3 text-rose-400" />
      <span className="text-[11px] font-medium text-rose-400 hidden sm:block">Offline</span>
    </button>
  )
}

export default function TopHeader() {
  const location = useLocation()
  const page = pageTitles[location.pathname] || { title: 'MQ IntelliMesh', subtitle: '' }
  const { backendStatus, retry } = useApiHealth()
  const { ceoMode, toggleCeoMode } = useDemo()

  return (
    <header className="h-14 bg-[#080D18]/95 backdrop-blur-md border-b border-slate-800/50 flex items-center px-5 gap-4 sticky top-0 z-30">
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-[14px] font-bold text-white leading-tight truncate">{page.title}</h1>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5 truncate hidden sm:block">{page.subtitle}</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 flex-shrink-0 max-w-xs w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
          <input
            type="text"
            placeholder="Search topology, queues, channels…"
            className="w-full bg-slate-900/60 border border-slate-800/60 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-400 placeholder-slate-700 focus:outline-none focus:border-blue-500/40 focus:bg-slate-900 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <BackendIndicator status={backendStatus} onRetry={retry} />

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/8 border border-blue-500/20">
          <Cpu className="w-3 h-3 text-blue-400" />
          <span className="text-[11px] font-medium text-blue-300 hidden sm:block">AI Active</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleCeoMode}
          title={ceoMode ? 'Exit Presentation Mode' : 'Enter Presentation Mode'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
            ceoMode
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600/60'
          }`}
        >
          {ceoMode ? <MonitorPlay className="w-3 h-3" /> : <Presentation className="w-3 h-3" />}
          <span className="hidden lg:block">{ceoMode ? 'Demo Mode' : 'Present'}</span>
        </motion.button>

        <AnimatePresence>
          {ceoMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.9, width: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-300 whitespace-nowrap">LIVE</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-all">
          <Bell className="w-3.5 h-3.5" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        <button className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-all">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-slate-800 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-black text-white">
            PB
          </div>
          <ChevronDown className="w-3 h-3 text-slate-600" />
        </div>
      </div>
    </header>
  )
}
