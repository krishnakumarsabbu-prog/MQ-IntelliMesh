import { motion } from 'framer-motion'
import { TrendingDown, Info } from 'lucide-react'
import type { DimensionScore } from '../../data/complexityData'

interface ComplexityBreakdownTableProps {
  dimensions: DimensionScore[]
}

function ScoreBar({ value, color, delay }: { value: number; color: string; delay: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-400 w-6 text-right flex-shrink-0">{value}</span>
    </div>
  )
}

export default function ComplexityBreakdownTable({ dimensions }: ComplexityBreakdownTableProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Score Breakdown by Dimension</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">8 weighted dimensions contributing to total MTCS</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-600 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500/60" />
            As-Is
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
            Target
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800/40">
        {dimensions.map((dim, i) => (
          <motion.div
            key={dim.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 + 0.1 }}
            className="px-5 py-4 hover:bg-slate-800/15 transition-colors group"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-4">
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: dim.color, boxShadow: `0 0 6px ${dim.color}60` }}
                  />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-200">{dim.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-600 font-mono">weight: {Math.round(dim.weight * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">As-Is</div>
                  <ScoreBar value={dim.asIs} color={dim.color} delay={i * 0.06 + 0.3} />
                </div>
                <div>
                  <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Target</div>
                  <ScoreBar value={dim.target} color="#10B981" delay={i * 0.06 + 0.4} />
                </div>
              </div>

              <div className="col-span-12 md:col-span-3 flex items-center justify-between md:justify-end gap-3">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-[13px] font-black text-emerald-400 tabular-nums">-{dim.improvement}%</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-700/40">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="mt-2.5 ml-5">
              <p className="text-[11px] text-slate-600 leading-relaxed">{dim.explanation}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
