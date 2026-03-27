import { motion } from 'framer-motion'
import { TrendingDown, Route, GitBranch, ShieldCheck, Network, Boxes, Shuffle } from 'lucide-react'
import type { impactMetrics } from '../../data/complexityData'

type ImpactMetric = typeof impactMetrics[number]

interface ImpactGridProps {
  metrics: ImpactMetric[]
}

const iconMap: Record<string, React.ElementType> = {
  routing: Route,
  channel: GitBranch,
  policy: ShieldCheck,
  graph: Network,
  fanout: Boxes,
  entropy: Shuffle,
}

const iconColors = [
  { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', bar: 'from-blue-500 to-cyan-400' },
  { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', bar: 'from-cyan-500 to-teal-400' },
  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'from-emerald-500 to-green-400' },
  { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', bar: 'from-teal-500 to-cyan-400' },
  { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'from-amber-500 to-orange-400' },
  { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', bar: 'from-rose-500 to-pink-400' },
]

export default function ImpactGrid({ metrics }: ImpactGridProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Simplification Impact Analysis</h2>
          <p className="text-[11px] text-slate-500">Quantified improvements across key structural metrics</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {metrics.map((metric, i) => {
          const IconComp = iconMap[metric.icon] || TrendingDown
          const clr = iconColors[i % iconColors.length]
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/60 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${clr.bg} border ${clr.border} flex items-center justify-center`}>
                  <IconComp className={`w-4.5 h-4.5 ${clr.color}`} style={{ width: 18, height: 18 }} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black font-mono px-2 py-1 rounded-lg ${clr.bg} ${clr.color} border ${clr.border}`}>
                  <TrendingDown className="w-3 h-3" />
                  -{metric.reduction}%
                </div>
              </div>

              <div className="text-[12px] font-semibold text-slate-300 mb-3">{metric.label}</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">Before</span>
                  <span className="font-mono text-slate-400">{metric.before} <span className="text-slate-600">{metric.unit}</span></span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-slate-700" style={{ width: '100%' }} />
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">After</span>
                  <span className={`font-mono font-bold ${clr.color}`}>{metric.after} <span className="text-slate-600">{metric.unit}</span></span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${clr.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(metric.after / metric.before) * 100}%` }}
                    transition={{ duration: 0.9, delay: i * 0.07 + 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
