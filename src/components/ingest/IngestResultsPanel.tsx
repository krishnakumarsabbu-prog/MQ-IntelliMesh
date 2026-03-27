import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Server,
  Layers,
  AppWindow,
  ArrowLeftRight,
  GitBranch,
  AlertTriangle,
  Clock,
  Database,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { useIngest } from '../../context/IngestContext'

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
  delay?: number
}

function StatCard({ label, value, icon: Icon, color, bgColor, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="bg-[#111827] border border-slate-800/60 rounded-xl p-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value.toLocaleString()}</div>
    </motion.div>
  )
}

interface IngestResultsPanelProps {
  onReingest?: () => void
}

export default function IngestResultsPanel({ onReingest }: IngestResultsPanelProps) {
  const { result, ingestedAt, reset } = useIngest()

  if (!result) return null

  const stats = [
    { label: 'Queue Managers', value: result.queue_managers, icon: Server, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
    { label: 'Queues', value: result.queues, icon: Layers, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { label: 'Applications', value: result.applications, icon: AppWindow, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { label: 'Channels', value: result.channels, icon: ArrowLeftRight, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { label: 'Relationships', value: result.relationships, icon: GitBranch, color: 'text-sky-400', bgColor: 'bg-sky-500/10' },
    { label: 'Files Processed', value: result.files_processed?.length ?? 0, icon: Database, color: 'text-slate-400', bgColor: 'bg-slate-700/40' },
  ]

  const warnings = [
    ...(result.warnings ?? []),
    ...(result.files_processed ?? []).flatMap(f => f.warnings ?? []),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-[#0F172A] border border-emerald-500/20 rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-800/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">MQ Inventory Loaded</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Estate model built and ready for analysis</p>
            </div>
          </div>
          <button
            onClick={() => { reset(); onReingest?.() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Re-ingest
          </button>
        </div>

        {ingestedAt && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/8 border border-emerald-500/15">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">Ingestion Complete</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
              <Clock className="w-3 h-3" />
              <span>{formatDate(ingestedAt)} at {formatTime(ingestedAt)}</span>
            </div>
            {result.dataset_id && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                <Database className="w-3 h-3" />
                <span className="truncate max-w-[160px]">{result.dataset_id}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.06} />
          ))}
        </div>

        {result.files_processed && result.files_processed.length > 0 && (
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Files Processed</span>
            </div>
            <div className="space-y-1.5">
              {result.files_processed.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 py-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" />
                  <span className="text-[12px] font-mono text-slate-400 flex-1">{f.filename}</span>
                  <span className="text-[11px] font-mono text-slate-600">{f.dataset_type}</span>
                  <span className="text-[11px] font-mono text-blue-400 tabular-nums">{f.rows.toLocaleString()} rows</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1">
              {warnings.slice(0, 6).map((w, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 text-[10px] mt-0.5 flex-shrink-0">•</span>
                  <span className="text-[12px] text-amber-400/80">{w}</span>
                </div>
              ))}
              {warnings.length > 6 && (
                <p className="text-[11px] text-amber-600/60 mt-1">+{warnings.length - 6} more warnings</p>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-500/8 border border-blue-500/15"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[13px] font-medium text-blue-300">
              Estate model ready — run analysis to surface findings
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-500/50" />
        </motion.div>
      </div>
    </motion.div>
  )
}
