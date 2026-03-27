import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, TrendingDown } from 'lucide-react'
import type { beforeAfterComparison } from '../../data/targetStateData'

type ComparisonData = typeof beforeAfterComparison

interface BeforeAfterComparisonProps {
  data: ComparisonData
}

type Mode = 'before' | 'after' | 'diff'

const rows = [
  { key: 'queueManagers' as const, label: 'Queue Managers', lowerIsBetter: true },
  { key: 'queues' as const, label: 'Total Queues', lowerIsBetter: true },
  { key: 'channels' as const, label: 'Active Channels', lowerIsBetter: true },
  { key: 'avgHops' as const, label: 'Avg Routing Hops', lowerIsBetter: true },
  { key: 'complexityScore' as const, label: 'Complexity Score', lowerIsBetter: true },
  { key: 'violations' as const, label: 'Policy Violations', lowerIsBetter: true },
  { key: 'orphanObjects' as const, label: 'Orphan Objects', lowerIsBetter: true },
  { key: 'redundantChannels' as const, label: 'Redundant Channels', lowerIsBetter: true },
]

export default function BeforeAfterComparison({ data }: BeforeAfterComparisonProps) {
  const [mode, setMode] = useState<Mode>('diff')

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Before vs After Comparison</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">As-Is estate vs AI-generated target architecture</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/40">
          {(['before', 'after', 'diff'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all capitalize ${
                mode === m
                  ? m === 'before'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : m === 'after'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'diff' ? (
          <motion.div
            key="diff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-3 border-b border-slate-800/60">
              <div className="px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Metric</div>
              <div className="px-5 py-2.5 text-[10px] font-semibold text-rose-400/70 uppercase tracking-wider text-center">As-Is</div>
              <div className="px-5 py-2.5 text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider text-center">Target</div>
            </div>
            {rows.map((row, i) => {
              const before = data.before[row.key]
              const after = data.after[row.key]
              const pct = before > 0 ? Math.round(((Number(before) - Number(after)) / Number(before)) * 100) : 0
              const improved = row.lowerIsBetter ? Number(after) < Number(before) : Number(after) > Number(before)
              return (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-3 border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors"
                >
                  <div className="px-5 py-3 text-[12px] text-slate-400">{row.label}</div>
                  <div className="px-5 py-3 text-center">
                    <span className="text-[13px] font-semibold tabular-nums text-slate-400 line-through decoration-rose-500/40">{before}</span>
                  </div>
                  <div className="px-5 py-3 text-center flex items-center justify-center gap-2">
                    <span className="text-[13px] font-bold tabular-nums text-emerald-400">{after}</span>
                    {pct !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${improved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {improved ? '-' : '+'}{Math.abs(pct)}%
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : mode === 'before' ? (
          <motion.div
            key="before"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5"
          >
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-rose-500/5 border border-rose-500/15 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[12px] font-semibold text-rose-300">As-Is State — Current MQ Estate</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rows.map((row) => (
                <div key={row.key} className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/30">
                  <div className="text-[20px] font-bold text-slate-300 tabular-nums">{data.before[row.key]}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{row.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="after"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5"
          >
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-semibold text-emerald-300">Target State — AI-Generated Architecture</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rows.map((row) => (
                <div key={row.key} className="bg-emerald-500/5 rounded-xl p-3.5 border border-emerald-500/15">
                  <div className="text-[20px] font-bold text-emerald-400 tabular-nums">{data.after[row.key]}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{row.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 py-3.5 border-t border-slate-800/60 bg-emerald-500/3">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <span className="text-[12px] text-emerald-300 font-semibold">Simplified Architecture</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[12px] text-slate-500">41% complexity reduction · 100% policy compliant · automation-ready</span>
        </div>
      </div>
    </div>
  )
}
