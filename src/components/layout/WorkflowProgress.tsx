import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Upload,
  BrainCircuit,
  GitBranch,
  ShieldCheck,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useIngest } from '../../context/IngestContext'
import { useAnalysis } from '../../context/AnalysisContext'
import { useExport } from '../../context/ExportContext'

interface WorkflowStep {
  id: string
  label: string
  sublabel: string
  icon: React.ElementType
  path: string
  getState: (ctx: WorkflowCtx) => 'completed' | 'active' | 'running' | 'available' | 'locked'
}

interface WorkflowCtx {
  isIngested: boolean
  isAnalyzed: boolean
  isExported: boolean
  ingestStatus: string
  analysisStatus: string
  exportStatus: string
  pathname: string
}

const STEPS: WorkflowStep[] = [
  {
    id: 'ingest',
    label: 'Ingest',
    sublabel: 'Upload topology',
    icon: Upload,
    path: '/dashboard',
    getState: ({ isIngested, ingestStatus, pathname }) => {
      if (ingestStatus === 'uploading' || ingestStatus === 'processing') return 'running'
      if (isIngested) return 'completed'
      if (pathname === '/dashboard') return 'active'
      return 'available'
    },
  },
  {
    id: 'analyze',
    label: 'Analyze',
    sublabel: 'Detect anomalies',
    icon: BrainCircuit,
    path: '/findings',
    getState: ({ isIngested, isAnalyzed, analysisStatus, pathname }) => {
      if (analysisStatus === 'running') return 'running'
      if (isAnalyzed) return 'completed'
      if (isIngested && (pathname === '/findings' || pathname === '/topology' || pathname === '/dashboard')) return 'active'
      if (isIngested) return 'available'
      return 'locked'
    },
  },
  {
    id: 'transform',
    label: 'Transform',
    sublabel: 'Generate target state',
    icon: GitBranch,
    path: '/target-state',
    getState: ({ isAnalyzed, pathname }) => {
      if (isAnalyzed && pathname === '/target-state') return 'active'
      if (isAnalyzed) return 'available'
      return 'locked'
    },
  },
  {
    id: 'validate',
    label: 'Validate',
    sublabel: 'Verify compliance',
    icon: ShieldCheck,
    path: '/complexity-lab',
    getState: ({ isAnalyzed, pathname }) => {
      if (isAnalyzed && pathname === '/complexity-lab') return 'active'
      if (isAnalyzed) return 'available'
      return 'locked'
    },
  },
  {
    id: 'export',
    label: 'Export',
    sublabel: 'Delivery artifacts',
    icon: PackageCheck,
    path: '/exports',
    getState: ({ isExported, exportStatus, isAnalyzed, pathname }) => {
      if (exportStatus === 'generating') return 'running'
      if (isExported) return 'completed'
      if (isAnalyzed && pathname === '/exports') return 'active'
      if (isAnalyzed) return 'available'
      return 'locked'
    },
  },
]

const STATE_STYLES = {
  completed: {
    wrapper: 'bg-emerald-500/10 border-emerald-500/30',
    icon: 'text-emerald-400',
    label: 'text-emerald-300',
    sublabel: 'text-emerald-500/70',
    dot: 'bg-emerald-400',
  },
  active: {
    wrapper: 'bg-blue-500/12 border-blue-500/40 ring-1 ring-blue-500/15',
    icon: 'text-blue-400',
    label: 'text-blue-200',
    sublabel: 'text-blue-400/60',
    dot: 'bg-blue-400',
  },
  running: {
    wrapper: 'bg-amber-500/8 border-amber-500/25',
    icon: 'text-amber-400',
    label: 'text-amber-300',
    sublabel: 'text-amber-400/60',
    dot: 'bg-amber-400',
  },
  available: {
    wrapper: 'bg-slate-800/50 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/70',
    icon: 'text-slate-400',
    label: 'text-slate-300',
    sublabel: 'text-slate-600',
    dot: 'bg-slate-500',
  },
  locked: {
    wrapper: 'bg-slate-900/40 border-slate-800/30 opacity-40 cursor-not-allowed',
    icon: 'text-slate-600',
    label: 'text-slate-600',
    sublabel: 'text-slate-700',
    dot: 'bg-slate-700',
  },
}

export default function WorkflowProgress() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isReady, status: ingestStatus } = useIngest()
  const { isAnalyzed, status: analysisStatus } = useAnalysis()
  const { isExported, status: exportStatus } = useExport()

  const ctx: WorkflowCtx = {
    isIngested: isReady,
    isAnalyzed,
    isExported,
    ingestStatus,
    analysisStatus,
    exportStatus,
    pathname,
  }

  const completedCount = STEPS.filter(s => s.getState(ctx) === 'completed').length
  const progressPct = (completedCount / STEPS.length) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0F1E]/95 border-b border-slate-800/50 px-6 py-2.5 flex items-center gap-4"
      >
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Journey</span>
          <span className="text-[10px] font-mono text-slate-600 ml-1">{completedCount}/{STEPS.length}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-1">
          {STEPS.map((step, i) => {
            const state = step.getState(ctx)
            const styles = STATE_STYLES[state]
            const Icon = step.icon
            const isClickable = state !== 'locked'

            return (
              <div key={step.id} className="flex items-center gap-1.5">
                <motion.button
                  whileHover={isClickable ? { scale: 1.02 } : {}}
                  whileTap={isClickable ? { scale: 0.98 } : {}}
                  onClick={() => isClickable && navigate(step.path)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${styles.wrapper}`}
                >
                  {state === 'running' ? (
                    <Loader2 className={`w-3 h-3 ${styles.icon} animate-spin flex-shrink-0`} />
                  ) : state === 'completed' ? (
                    <CheckCircle2 className={`w-3 h-3 ${styles.icon} flex-shrink-0`} />
                  ) : (
                    <Icon className={`w-3 h-3 ${styles.icon} flex-shrink-0`} />
                  )}
                  <span className={styles.label}>{step.label}</span>
                  <span className={`hidden sm:block ${styles.sublabel} text-[9px]`}>{step.sublabel}</span>
                </motion.button>

                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-600">{Math.round(progressPct)}%</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
