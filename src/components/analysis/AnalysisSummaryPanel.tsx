import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Info,
  Sparkles,
  Server,
  Heart,
  RefreshCw,
  ChevronRight,
  Clock,
  BarChart3,
  GitBranch,
} from 'lucide-react'
import { useAnalysis } from '../../context/AnalysisContext'

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

interface SeverityPillProps {
  count: number
  label: string
  icon: React.ElementType
  color: string
  bg: string
  delay?: number
}

function SeverityPill({ count, label, icon: Icon, color, bg, delay = 0 }: SeverityPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border ${bg}`}
    >
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xl font-bold tabular-nums ${color}`}>{count}</span>
      <span className="text-[10px] text-slate-500 font-medium">{label}</span>
    </motion.div>
  )
}

interface AnalysisSummaryPanelProps {
  onReanalyze?: () => void
}

export default function AnalysisSummaryPanel({ onReanalyze }: AnalysisSummaryPanelProps) {
  const { result, analyzedAt, reset } = useAnalysis()
  if (!result) return null

  const { summary, health, hotspots } = result
  const sb = summary.severity_breakdown

  const categoryEntries = Object.entries(summary.category_breakdown ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0F172A] border border-emerald-500/20 rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-800/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">Topology Intelligence Report</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {summary.total_findings} findings across {Object.keys(summary.category_breakdown ?? {}).length} categories
              </p>
            </div>
          </div>
          <button
            onClick={() => { reset(); onReanalyze?.() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Re-analyze
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/8 border border-emerald-500/15">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-400">Analysis Complete</span>
          </div>
          {analyzedAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
              <Clock className="w-3 h-3" />
              <span>{formatDate(analyzedAt)} at {formatTime(analyzedAt)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
            <GitBranch className="w-3 h-3" />
            <span className="truncate max-w-[160px]">{result.dataset_id}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-3">
          <SeverityPill
            count={sb.critical}
            label="Critical"
            icon={AlertOctagon}
            color="text-rose-400"
            bg="bg-rose-500/8 border-rose-500/20"
            delay={0}
          />
          <SeverityPill
            count={sb.high}
            label="High"
            icon={ShieldAlert}
            color="text-orange-400"
            bg="bg-orange-500/8 border-orange-500/20"
            delay={0.05}
          />
          <SeverityPill
            count={sb.medium}
            label="Medium"
            icon={AlertTriangle}
            color="text-amber-400"
            bg="bg-amber-500/8 border-amber-500/20"
            delay={0.1}
          />
          <SeverityPill
            count={sb.low}
            label="Low"
            icon={Info}
            color="text-blue-400"
            bg="bg-blue-500/8 border-blue-500/20"
            delay={0.15}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111827] border border-slate-800/60 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] text-slate-500">Estate Health</span>
            </div>
            <div className={`text-2xl font-bold tabular-nums mb-0.5 ${
              health.score >= 70 ? 'text-emerald-400' :
              health.score >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {health.score}<span className="text-base text-slate-600">%</span>
            </div>
            <div className="text-[11px] text-slate-600">{health.label}</div>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  health.score >= 70 ? 'bg-emerald-500' :
                  health.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${health.score}%` }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#111827] border border-slate-800/60 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-500">Policy Violations</span>
            </div>
            <div className="text-2xl font-bold tabular-nums text-amber-400 mb-0.5">
              {summary.policy_violations}
            </div>
            <div className="text-[11px] text-slate-600">require remediation</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111827] border border-slate-800/60 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] text-slate-500">Simplification Ops</span>
            </div>
            <div className="text-2xl font-bold tabular-nums text-blue-400 mb-0.5">
              {summary.simplification_opportunities}
            </div>
            <div className="text-[11px] text-slate-600">optimization candidates</div>
          </motion.div>
        </div>

        {categoryEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Findings by Category</span>
            </div>
            <div className="space-y-2">
              {categoryEntries.map(([cat, count], i) => {
                const maxCount = Math.max(...categoryEntries.map(([, c]) => c))
                return (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[11px] text-slate-400 w-44 truncate flex-shrink-0 capitalize">
                      {cat.replace(/_/g, ' ').toLowerCase()}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500/60 rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 w-6 text-right flex-shrink-0">{count}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {hotspots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                {hotspots.length} Risk Hotspot{hotspots.length > 1 ? 's' : ''} Detected
              </span>
            </div>
            <div className="space-y-1.5">
              {hotspots.slice(0, 4).map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-start gap-2.5"
                >
                  <ChevronRight className="w-3 h-3 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-medium text-slate-300">{h.object_id}</span>
                    <span className="text-[11px] text-slate-600 ml-1.5 font-mono">{h.object_type}</span>
                    <p className="text-[11px] text-rose-400/70 mt-0.5">{h.reason}</p>
                  </div>
                  <span className="text-[10px] font-mono text-rose-500 flex-shrink-0">{h.finding_count} findings</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {health.contributing_factors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[13px] font-medium text-amber-300">
                  {health.contributing_factors[0]}
                </span>
                {health.contributing_factors.length > 1 && (
                  <span className="text-[11px] text-amber-600/60 ml-2">+{health.contributing_factors.length - 1} more factors</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-600/50 flex-shrink-0" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
