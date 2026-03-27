import { motion } from 'framer-motion'
import { Lock, CheckSquare } from 'lucide-react'
import type { assumptionItems } from '../../data/complexityData'

type AssumptionItem = typeof assumptionItems[number]

interface DeterminismFooterProps {
  assumptions: AssumptionItem[]
}

export default function DeterminismFooter({ assumptions }: DeterminismFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#0F172A] border border-slate-800/40 rounded-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/40">
        <div className="w-8 h-8 rounded-lg bg-slate-700/40 border border-slate-600/30 flex items-center justify-center">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-slate-300">Methodology & Assumptions</h2>
          <p className="text-[11px] text-slate-600">Scoring determinism, data sources, and operational context</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-semibold">Deterministic Model</span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {assumptions.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 + 0.3 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/40"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">{item}</p>
          </motion.div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-slate-800/40 bg-slate-900/20">
        <p className="text-[10px] text-slate-700 text-center">
          MTCS v2.1 · IBM MQ Enterprise Topology Complexity Model · Scoring engine calibrated on 200+ production topology datasets
        </p>
      </div>
    </motion.div>
  )
}
