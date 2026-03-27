import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck, Zap, TrendingDown, BarChart3, ArrowLeftRight, GitMerge, Activity, ArrowRight } from 'lucide-react'
import type { transformationMetrics } from '../../data/targetStateData'

interface TransformationHeroProps {
  metrics: typeof transformationMetrics
}

const metricCards = [
  {
    key: 'complexityReduction' as const,
    label: 'Complexity Reduction',
    suffix: '%',
    icon: TrendingDown,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    hint: 'from score 68 → 34',
  },
  {
    key: 'policyCompliance' as const,
    label: 'Policy Compliance',
    suffix: '%',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    hint: '18 violations resolved',
  },
  {
    key: 'channelsReduced' as const,
    label: 'Channels Reduced',
    suffix: '',
    icon: ArrowLeftRight,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    hint: '312 → 189 active',
  },
  {
    key: 'avgHopsReduced' as const,
    label: 'Avg Hops Reduced',
    suffix: '',
    icon: BarChart3,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    hint: '4.2 → 1.8 avg hops',
  },
  {
    key: 'violationsEliminated' as const,
    label: 'Violations Eliminated',
    suffix: '',
    icon: Activity,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    hint: '0 remaining',
  },
  {
    key: 'healthScoreImprovement' as const,
    label: 'Health Score Gain',
    suffix: ' pts',
    icon: GitMerge,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    hint: '74 → 100 score',
  },
]

export default function TransformationHero({ metrics }: TransformationHeroProps) {
  return (
    <div className="px-6 pt-5 pb-0">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1628] via-[#0D1F1A] to-[#0B1020] border border-emerald-900/40 p-7 mb-5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-80 h-48 bg-cyan-500/4 rounded-full blur-3xl translate-y-1/2" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-violet-500/4 rounded-full blur-2xl" />
        </div>

        <div className="relative flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Transformation Complete
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                Policy Compliant
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[11px] font-semibold text-blue-400">
                <Zap className="w-3 h-3" />
                Automation Ready
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Target-State Transformation
            </h1>
            <p className="text-[14px] text-slate-400 leading-relaxed mb-5 max-w-xl">
              A simplified, standardized, and automation-ready MQ architecture generated from the current estate analysis. Every decision is explainable. Every path validated.
            </p>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4" />
                Export Artifacts
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700/80 border border-slate-600/40 text-slate-300 text-sm font-semibold rounded-xl transition-all"
              >
                View Decisions
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="hidden xl:flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-5xl font-black text-emerald-400 tabular-nums leading-none">41%</div>
              <div className="text-[12px] text-slate-500 mt-1">Overall Complexity Reduction</div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-center px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <div className="text-lg font-bold text-white tabular-nums">47 <ArrowRight className="w-3.5 h-3.5 inline text-slate-600" /> 28</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Queue Managers</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <div className="text-lg font-bold text-white tabular-nums">312 <ArrowRight className="w-3.5 h-3.5 inline text-slate-600" /> 189</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Channels</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {metricCards.map((card, i) => {
          const Icon = card.icon
          const value = metrics[card.key]
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`bg-[#111827] border ${card.border} rounded-xl p-4 card-hover`}
            >
              <div className={`w-9 h-9 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`text-2xl font-bold tabular-nums mb-0.5 ${card.color}`}>
                {value}{card.suffix}
              </div>
              <div className="text-[12px] font-medium text-slate-400 leading-tight mb-0.5">{card.label}</div>
              <div className="text-[10px] text-slate-600 font-mono">{card.hint}</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
