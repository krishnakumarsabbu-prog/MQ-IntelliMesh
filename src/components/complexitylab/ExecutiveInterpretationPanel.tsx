import { motion } from 'framer-motion'
import { Lightbulb, Route, GitBranch, Users, Cpu, BarChart2 } from 'lucide-react'
import type { executiveInsights } from '../../data/complexityData'

type Insight = typeof executiveInsights[number]

interface ExecutiveInterpretationPanelProps {
  insights: Insight[]
}

const iconMap: Record<string, React.ElementType> = {
  routing: Route,
  channel: GitBranch,
  governance: Users,
  automation: Cpu,
  entropy: BarChart2,
}

const accentColors = [
  { bg: 'bg-blue-500/8', border: 'border-blue-500/15', icon: 'bg-blue-500/15 border-blue-500/25 text-blue-400' },
  { bg: 'bg-cyan-500/8', border: 'border-cyan-500/15', icon: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-400' },
  { bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', icon: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' },
  { bg: 'bg-teal-500/8', border: 'border-teal-500/15', icon: 'bg-teal-500/15 border-teal-500/25 text-teal-400' },
  { bg: 'bg-amber-500/8', border: 'border-amber-500/15', icon: 'bg-amber-500/15 border-amber-500/25 text-amber-400' },
]

export default function ExecutiveInterpretationPanel({ insights }: ExecutiveInterpretationPanelProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Executive Interpretation</h2>
          <p className="text-[11px] text-slate-500">What these complexity reductions mean in operational terms</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const IconComp = iconMap[insight.icon] || Lightbulb
          const clr = accentColors[i % accentColors.length]
          const [iconBg, iconBorder, iconColor] = clr.icon.split(' ')
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.1 }}
              className={`${clr.bg} border ${clr.border} rounded-xl p-4 hover:brightness-110 transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${iconBg} border ${iconBorder} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <IconComp className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-white leading-snug mb-1.5">{insight.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{insight.detail}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
