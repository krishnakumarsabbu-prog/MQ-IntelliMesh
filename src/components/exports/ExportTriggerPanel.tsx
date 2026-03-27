import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PackageCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  Cpu,
} from 'lucide-react'
import { useExport } from '../../context/ExportContext'
import { useIngest } from '../../context/IngestContext'
import { useAnalysis } from '../../context/AnalysisContext'
import { generateExportBundle } from '../../lib/api/export'
import { ApiRequestError } from '../../lib/api/client'

const GENERATION_MESSAGES = [
  'Generating target-state datasets…',
  'Preparing automation-ready artifacts…',
  'Packaging MQ topology outputs…',
  'Writing transformation decisions log…',
  'Compiling validation and compliance report…',
  'Building delivery bundle…',
  'Finalizing export manifest…',
]

const CAPABILITY_CARDS = [
  {
    icon: FileSpreadsheet,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/20',
    title: 'Target-State CSVs',
    desc: 'Queue managers, queues, channels, applications, routes',
  },
  {
    icon: FileJson,
    color: 'text-blue-400',
    bg: 'bg-blue-500/8 border-blue-500/20',
    title: 'Intelligence Reports',
    desc: 'Analysis findings, transformation decisions, complexity comparison',
  },
  {
    icon: ShieldCheck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/8 border-cyan-500/20',
    title: 'Validation & Compliance',
    desc: 'Policy validation summary, governance checks, compliance evidence',
  },
  {
    icon: Package,
    color: 'text-amber-400',
    bg: 'bg-amber-500/8 border-amber-500/20',
    title: 'Delivery ZIP Bundle',
    desc: 'Single downloadable package with all artifacts and manifest',
  },
]

interface ExportTriggerPanelProps {
  onComplete?: () => void
}

export default function ExportTriggerPanel({ onComplete }: ExportTriggerPanelProps) {
  const { setGenerating, setSuccess, setError, status, error } = useExport()
  const { isReady, datasetId } = useIngest()
  const { isAnalyzed } = useAnalysis()

  const [msgIdx, setMsgIdx] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const isGenerating = status === 'generating'

  useEffect(() => {
    if (!isGenerating) return
    const id = setInterval(() => {
      setMsgIdx(i => (i + 1) % GENERATION_MESSAGES.length)
    }, 1800)
    return () => clearInterval(id)
  }, [isGenerating])

  async function handleGenerate() {
    abortRef.current = new AbortController()
    setGenerating()
    setMsgIdx(0)
    try {
      const result = await generateExportBundle(
        datasetId ?? undefined,
        undefined,
        abortRef.current.signal,
      )
      setSuccess(result)
      onComplete?.()
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const msg = err instanceof ApiRequestError ? err.message : 'Export generation failed. Please try again.'
      setError(msg)
    }
  }

  const missingPrereq = !isReady
    ? 'Upload and ingest your MQ topology CSV files before generating export artifacts.'
    : !isAnalyzed
    ? 'Run topology analysis before generating export artifacts. Analysis data is required to produce compliance and findings reports.'
    : null

  return (
    <div className="bg-[#0D1117] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <PackageCheck className="w-4.5 h-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Generate Transformation Artifacts</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Package the validated target-state topology for delivery and provisioning</p>
        </div>
      </div>

      <div className="p-5">
        {missingPrereq && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-500/6 border border-amber-500/20"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-amber-300">Prerequisites Not Met</p>
              <p className="text-[11px] text-amber-400/70 mt-0.5 leading-relaxed">{missingPrereq}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          {CAPABILITY_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border ${card.bg}`}
              >
                <Icon className={`w-4 h-4 ${card.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">{card.title}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{card.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="text-[13px] font-semibold text-emerald-300">
                  {GENERATION_MESSAGES[msgIdx]}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                  animate={{ width: ['20%', '85%'] }}
                  transition={{ duration: 12, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-rose-500/6 border border-rose-500/20 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-rose-300">Export Failed</p>
                <p className="text-[11px] text-rose-400/70 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          ) : status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 mb-4"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-[12px] font-semibold text-emerald-300">Transformation artifact bundle generated successfully.</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: missingPrereq || isGenerating ? 1 : 1.01 }}
          whileTap={{ scale: missingPrereq || isGenerating ? 1 : 0.98 }}
          onClick={handleGenerate}
          disabled={!!missingPrereq || isGenerating}
          className={
            "w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13px] font-bold transition-all " +
            (missingPrereq || isGenerating
              ? "bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-700/40"
              : status === 'success'
              ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30"
              : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20")
          }
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : status === 'success' ? (
            <>
              <Cpu className="w-4 h-4" />
              Re-generate Artifacts
            </>
          ) : (
            <>
              <PackageCheck className="w-4 h-4" />
              Generate Delivery Package
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
