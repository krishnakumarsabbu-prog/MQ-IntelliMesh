import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Network,
  AlertTriangle,
  Wand2,
  Target,
  FlaskConical,
  BrainCircuit,
  Download,
  Zap,
  ChevronRight,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIngest } from '../../context/IngestContext'
import { useAnalysis } from '../../context/AnalysisContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/topology', label: 'As-Is Topology', icon: Network },
  { path: '/findings', label: 'Findings', icon: AlertTriangle },
  { path: '/planner', label: 'Planner', icon: Wand2 },
  { path: '/target-state', label: 'Target State', icon: Target },
  { path: '/complexity-lab', label: 'Complexity Lab', icon: FlaskConical },
  { path: '/explainability', label: 'Explainability', icon: BrainCircuit },
  { path: '/exports', label: 'Exports', icon: Download },
]

export default function Sidebar() {
  const location = useLocation()
  const { isReady, result, status } = useIngest()
  const { isAnalyzed, totalFindings, healthScore } = useAnalysis()
  const isIngesting = status === 'uploading' || status === 'processing'

  const objectCount = isReady && result
    ? (result.queue_managers + result.queues + result.applications + result.channels + result.relationships)
    : null

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0F172A] border-r border-slate-800/60 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0F172A]" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white tracking-tight leading-tight">MQ IntelliMesh</div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">AI Topology Platform</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Navigation</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-blue-500/8 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800/60">
        <AnimatePresence mode="wait">
          {isAnalyzed ? (
            <motion.div
              key="analyzed"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-blue-500/8 rounded-xl p-3 border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-blue-300">Analysis Complete</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {totalFindings} findings · health {healthScore}%
              </p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </motion.div>
          ) : isReady && result ? (
            <motion.div
              key="loaded"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-emerald-500/8 rounded-xl p-3 border border-emerald-500/20"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-emerald-300">Dataset Loaded</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {objectCount !== null ? objectCount.toLocaleString() : '0'} objects ingested and indexed.
              </p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              </div>
            </motion.div>
          ) : isIngesting ? (
            <motion.div
              key="ingesting"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-blue-500/8 rounded-xl p-3 border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-blue-300">Ingesting…</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Parsing MQ topology dataset.</p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  initial={{ width: '10%' }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-slate-400">No Dataset Loaded</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">Upload CSV files from the Dashboard to begin analysis.</p>
              <div className="mt-2 h-1 bg-slate-700/50 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
            PB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-slate-200 truncate">Platform Architect</div>
            <div className="text-[10px] text-slate-500 truncate">Enterprise MQ Team</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
