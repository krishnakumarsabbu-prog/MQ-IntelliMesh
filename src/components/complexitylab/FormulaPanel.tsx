import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import type { formulaWeights } from '../../data/complexityData'

type FormulaWeight = typeof formulaWeights[number]

interface FormulaPanelProps {
  weights: FormulaWeight[]
}

const termColors = [
  '#3B82F6', '#06B6D4', '#8B5CF6', '#10B981',
  '#F59E0B', '#EF4444', '#F97316', '#A78BFA',
]

export default function FormulaPanel({ weights }: FormulaPanelProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Scoring Methodology</h2>
          <p className="text-[11px] text-slate-500">Weighted linear model — all inputs normalized to 0–100</p>
        </div>
      </div>

      <div className="p-5">
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 mb-5 overflow-x-auto">
          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">Formula</div>
          <div className="flex items-center flex-wrap gap-1.5 min-w-max">
            <span className="text-[13px] font-bold font-mono text-white">MTCS</span>
            <span className="text-[13px] text-slate-500 font-mono mx-1">=</span>
            {weights.map((w, i) => (
              <span key={w.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-slate-600 font-mono text-[13px] mx-0.5">+</span>}
                <span
                  className="font-mono text-[12px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    color: termColors[i],
                    background: `${termColors[i]}18`,
                    border: `1px solid ${termColors[i]}25`,
                  }}
                >
                  {w.weightPct}% × {w.label}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {weights.map((w, i) => (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-800/60 bg-slate-900/30"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: termColors[i], boxShadow: `0 0 5px ${termColors[i]}60` }}
              />
              <div>
                <div className="text-[10px] font-semibold text-slate-300 leading-tight">{w.label}</div>
                <div
                  className="text-[11px] font-black font-mono"
                  style={{ color: termColors[i] }}
                >
                  {w.weightPct}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[8px] text-slate-500 font-bold">i</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Weights are calibrated for IBM MQ enterprise operational patterns. Each dimension score is independently computed from raw topology graph metrics before weighting is applied. Score of 0 = no complexity, 100 = maximum complexity.
          </p>
        </div>
      </div>
    </div>
  )
}
