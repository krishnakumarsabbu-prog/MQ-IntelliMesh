import { motion } from 'framer-motion'
import { Sparkles, GitMerge, Route, Layers, ArrowLeftRight, Server } from 'lucide-react'
import type { transformationDecisions } from '../../data/targetStateData'

type Decision = typeof transformationDecisions[number]

interface DecisionPanelProps {
  decisions: Decision[]
}

const typeConfig = {
  ownership: { icon: Server, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Ownership' },
  routing: { icon: Route, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Routing' },
  pattern: { icon: Layers, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Pattern' },
  consolidation: { icon: GitMerge, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Consolidation' },
}

function ConfidenceBar({ score, delay }: { score: number; delay: number }) {
  const color = score >= 90 ? 'from-emerald-500 to-cyan-400' : score >= 80 ? 'from-blue-500 to-cyan-400' : 'from-amber-500 to-orange-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 w-8 text-right">{score}%</span>
    </div>
  )
}

export default function DecisionPanel({ decisions }: DecisionPanelProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Transformation Decisions</h2>
          <p className="text-[11px] text-slate-500">AI-backed architecture decisions with rationale and confidence</p>
        </div>
      </div>

      <div className="divide-y divide-slate-800/50">
        {decisions.map((decision, i) => {
          const cfg = typeConfig[decision.type]
          const Icon = cfg.icon
          return (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className="px-5 py-4 hover:bg-slate-800/15 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-white">{decision.subject}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-slate-300 mb-2">{decision.change}</p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30">
                      <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Reason</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{decision.reason}</p>
                    </div>
                    <div className="bg-emerald-500/4 rounded-lg p-2.5 border border-emerald-500/10">
                      <div className="text-[9px] font-semibold text-emerald-500/70 uppercase tracking-wider mb-1">Benefit</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{decision.benefit}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider">AI Confidence</span>
                    </div>
                    <ConfidenceBar score={decision.confidence} delay={i * 0.07 + 0.4} />
                  </div>
                </div>
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
