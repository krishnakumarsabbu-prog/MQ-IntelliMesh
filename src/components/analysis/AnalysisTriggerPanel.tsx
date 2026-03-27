import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import { runAnalysis } from '../../lib/api/analyze'
import { ApiRequestError } from '../../lib/api/client'
import { useIngest } from '../../context/IngestContext'
import { useAnalysis } from '../../context/AnalysisContext'

const ANALYSIS_MESSAGES = [
  'Building topology intelligence…',
  'Detecting policy violations…',
  'Scoring structural complexity…',
  'Identifying routing anomalies…',
  'Mapping dependency hotspots…',
  'Calculating health vectors…',
  'Finalizing findings report…',
]

interface AnalysisTriggerPanelProps {
  onComplete?: () => void
  compact?: boolean
}

export default function AnalysisTriggerPanel({ onComplete, compact = false }: AnalysisTriggerPanelProps) {
  const [msgIndex, setMsgIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { isReady: ingestReady, datasetId } = useIngest()
  const { status, error, isAnalyzed, result, setRunning, setSuccess, setError } = useAnalysis()

  const isRunning = status === 'running'

  const startMessages = useCallback(() => {
    let i = 0
    setMsgIndex(0)
    timerRef.current = setInterval(() => {
      i = (i + 1) % ANALYSIS_MESSAGES.length
      setMsgIndex(i)
    }, 1600)
  }, [])

  const stopMessages = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!ingestReady || isRunning) return
    setRunning()
    startMessages()
    try {
      const result = await runAnalysis(datasetId ?? undefined)
      stopMessages()
      setSuccess(result)
      onComplete?.()
    } catch (err) {
      stopMessages()
      const msg = err instanceof ApiRequestError
        ? err.message
        : 'Analysis failed. Ensure the topology dataset is correctly ingested.'
      setError(msg)
    }
  }, [ingestReady, isRunning, datasetId, setRunning, setSuccess, setError, startMessages, stopMessages, onComplete])

  if (compact) {
    return (
      <AnimatePresence mode="wait">
        {isAnalyzed ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-medium text-emerald-300">Analysis Complete</span>
            <span className="text-[11px] text-slate-600 font-mono ml-1">
              {result?.summary?.total_findings ?? 0} findings
            </span>
          </motion.div>
        ) : isRunning ? (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-500/8 border border-blue-500/20"
          >
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <AnimatePresence mode="wait">
              <motion.span
                key={msgIndex}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="text-[13px] font-medium text-blue-300"
              >
                {ANALYSIS_MESSAGES[msgIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.button
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!ingestReady}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <BrainCircuit className="w-4 h-4" />
            Analyze Estate
          </motion.button>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="bg-[#0F172A] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">Run Topology Intelligence</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Analyze your ingested estate for risks, violations, and optimization signals</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Policy checks', count: '10', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: 'Topology patterns', count: '7', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Intelligence signals', count: '5', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-800/50">
              <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">{item.count}</div>
                <div className="text-[10px] text-slate-600">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="running"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex flex-col items-center gap-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={msgIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="text-[13px] font-medium text-emerald-300"
                  >
                    {ANALYSIS_MESSAGES[msgIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                  initial={{ width: '5%' }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[11px] text-slate-600">Analyzing topology model — this takes a few seconds</p>
            </motion.div>
          ) : status === 'error' && error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-500/8 border border-rose-500/20"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-rose-300 mb-0.5">Analysis Failed</p>
                <p className="text-[12px] text-rose-400/70">{error}</p>
              </div>
            </motion.div>
          ) : isAnalyzed ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-emerald-300">Intelligence generated</p>
                  <p className="text-[11px] text-emerald-500/70 mt-0.5">
                    {result?.summary?.total_findings ?? 0} findings · {result?.summary?.critical_and_high ?? 0} critical/high · health {result?.health?.score ?? 0}%
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            </motion.div>
          ) : !ingestReady ? (
            <motion.div
              key="no-dataset"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/30"
            >
              <Zap className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <p className="text-[12px] text-slate-600">Upload and ingest a topology dataset first to enable analysis.</p>
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleAnalyze}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <BrainCircuit className="w-4 h-4" />
              Analyze Estate
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
