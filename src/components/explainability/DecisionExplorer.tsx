import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, TrendingDown, TrendingUp, ChevronDown, ChevronUp, Server, ArrowRightLeft, GitBranch, ShieldCheck, Route, AlertTriangle } from 'lucide-react'
import { decisionRecords } from '../../data/explainabilityData'
import type { DecisionRecord } from '../../data/explainabilityData'

const categories = ['All', 'App Assignment', 'Queue Standardization', 'Channel Simplification', 'Policy Enforcement', 'Routing Optimization', 'Risk Mitigation'] as const
type Category = typeof categories[number]

const categoryIcons: Record<string, React.ElementType> = {
  'App Assignment': Server,
  'Queue Standardization': ArrowRightLeft,
  'Channel Simplification': GitBranch,
  'Policy Enforcement': ShieldCheck,
  'Routing Optimization': Route,
  'Risk Mitigation': AlertTriangle,
}

const categoryColors: Record<string, string> = {
  'App Assignment': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Queue Standardization': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Channel Simplification': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Policy Enforcement': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Routing Optimization': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  'Risk Mitigation': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

function ConfidenceBar({ value, delay }: { value: number; delay: number }) {
  const color = value >= 95 ? '#10B981' : value >= 85 ? '#3B82F6' : '#F59E0B'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold flex-shrink-0" style={{ color }}>{value}%</span>
    </div>
  )
}

function DecisionCard({ record, index }: { record: DecisionRecord; index: number }) {
  const [open, setOpen] = useState(false)
  const CatIcon = categoryIcons[record.category] || Server
  const catColors = categoryColors[record.category] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.1 }}
      className="bg-slate-900/40 border border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-700/60 transition-all"
    >
      <button
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${catColors}`}>
          <CatIcon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[12px] font-bold text-white">{record.subject}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${catColors}`}>
              {record.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{record.change}</p>
        </div>
        <div className="flex-shrink-0 ml-2">
          {open ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-800/40"
          >
            <div className="px-4 py-4 space-y-4">
              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1.5 font-semibold">Reasoning</div>
                <p className="text-[12px] text-slate-300 leading-relaxed">{record.why}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/60 rounded-lg p-2.5 text-center">
                  <div className={`text-[16px] font-black tabular-nums flex items-center justify-center gap-1 ${record.complexityDelta < 0 ? 'text-emerald-400' : record.complexityDelta > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {record.complexityDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : record.complexityDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                    {record.complexityDelta > 0 ? '+' : ''}{record.complexityDelta}
                  </div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Complexity</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 text-center">
                  <div className={`text-[16px] font-black tabular-nums flex items-center justify-center gap-1 ${record.riskDelta < 0 ? 'text-emerald-400' : record.riskDelta > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {record.riskDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                    {record.riskDelta > 0 ? '+' : ''}{record.riskDelta}
                  </div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Risk</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5">
                  <div className="text-[9px] text-slate-600 mb-1">Confidence</div>
                  <ConfidenceBar value={record.confidence} delay={0} />
                </div>
              </div>

              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1.5 font-semibold">Affected Objects</div>
                <div className="flex flex-wrap gap-1.5">
                  {record.affectedObjects.map(obj => (
                    <span key={obj} className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-400">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function DecisionExplorer() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filtered = activeCategory === 'All'
    ? decisionRecords
    : decisionRecords.filter(d => d.category === activeCategory)

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Compass className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Transformation Decision Explorer</h2>
          <p className="text-[11px] text-slate-500">Browse and inspect every AI-generated transformation decision with full reasoning</p>
        </div>
        <div className="ml-auto text-[11px] text-slate-600 font-mono">{filtered.length} decisions</div>
      </div>

      <div className="px-4 py-3 border-b border-slate-800/40 flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeCategory === cat
                ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-2.5 max-h-[520px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {filtered.map((rec, i) => (
            <DecisionCard key={rec.id} record={rec} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
