import { motion } from 'framer-motion'
import { Sparkles, AlertOctagon, AlertTriangle } from 'lucide-react'
interface Highlight {
  id: string | number
  message: string
  severity: 'critical' | 'warning'
  count: number
}

interface IntelligencePanelProps {
  highlights: Highlight[]
}

const severityConfig = {
  critical: { icon: AlertOctagon, color: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/15', dot: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/15', dot: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400' },
}

export default function IntelligencePanel({ highlights }: IntelligencePanelProps) {
  return (
    <div className="bg-[#0F172A] border border-slate-800/60 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800/60">
        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-white">Topology Intelligence</h3>
          <p className="text-[10px] text-slate-500">AI-detected patterns &amp; risks</p>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {highlights.map((h, i) => {
          const cfg = severityConfig[h.severity]
          const Icon = cfg.icon
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 + 0.2 }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cfg.bg}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${cfg.color} flex-shrink-0`} />
                <span className="text-[11px] text-slate-300">{h.message}</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.badge} ml-2 flex-shrink-0`}>
                {h.count}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
