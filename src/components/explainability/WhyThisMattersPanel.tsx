import { motion } from 'framer-motion'
import { Lightbulb, Network, Route, ShieldCheck, Layers, Zap, Eye } from 'lucide-react'
import { architectureInsights } from '../../data/explainabilityData'
import type { ArchitectureInsight } from '../../data/explainabilityData'

const iconMap: Record<string, React.ElementType> = {
  network: Network,
  route: Route,
  shield: ShieldCheck,
  layers: Layers,
  explosion: Zap,
  eye: Eye,
}

const impactConfig = {
  high: { label: 'High Impact', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Medium Impact', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  low: { label: 'Low Impact', color: 'text-slate-400', bg: 'bg-slate-700/30', border: 'border-slate-700/40' },
}

const accentPalette = [
  { border: 'hover:border-violet-500/25', iconBg: 'bg-violet-500/10 border-violet-500/20', iconColor: 'text-violet-400' },
  { border: 'hover:border-blue-500/25', iconBg: 'bg-blue-500/10 border-blue-500/20', iconColor: 'text-blue-400' },
  { border: 'hover:border-emerald-500/25', iconBg: 'bg-emerald-500/10 border-emerald-500/20', iconColor: 'text-emerald-400' },
  { border: 'hover:border-cyan-500/25', iconBg: 'bg-cyan-500/10 border-cyan-500/20', iconColor: 'text-cyan-400' },
  { border: 'hover:border-teal-500/25', iconBg: 'bg-teal-500/10 border-teal-500/20', iconColor: 'text-teal-400' },
  { border: 'hover:border-blue-500/25', iconBg: 'bg-blue-500/10 border-blue-500/20', iconColor: 'text-blue-400' },
]

function InsightCard({ insight, index }: { insight: ArchitectureInsight; index: number }) {
  const IconComp = iconMap[insight.icon] || Lightbulb
  const impact = impactConfig[insight.impact]
  const accent = accentPalette[index % accentPalette.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 + 0.1 }}
      className={`bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 transition-all ${accent.border} group`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${accent.iconBg} border flex items-center justify-center flex-shrink-0`}>
          <IconComp className={`w-4 h-4 ${accent.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13px] font-semibold text-white leading-snug">{insight.title}</h3>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${impact.bg} ${impact.border} ${impact.color}`}>
              {impact.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Technical Change</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{insight.technical}</p>
        </div>
        <div className="w-full h-px bg-slate-800/60" />
        <div>
          <div className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Operational Meaning</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{insight.operational}</p>
        </div>
        <div className="w-full h-px bg-slate-800/60" />
        <div>
          <div className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Business Value</div>
          <p className="text-[11px] text-blue-300/70 leading-relaxed">{insight.businessValue}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function WhyThisMattersPanel() {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Why This Matters</h2>
          <p className="text-[11px] text-slate-500">Translating technical topology changes into operational and business significance</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {architectureInsights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} index={i} />
        ))}
      </div>
    </div>
  )
}
