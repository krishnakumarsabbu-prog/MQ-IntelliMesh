import { motion } from 'framer-motion'
import { Flame, AlertOctagon, AlertTriangle, Info, Server, Layout, GitBranch } from 'lucide-react'
import type { hotspots } from '../../data/complexityData'

type Hotspot = typeof hotspots[number]

interface HotspotPanelProps {
  items: Hotspot[]
}

const severityConfig = {
  critical: {
    bg: 'bg-rose-500/8',
    border: 'border-rose-500/20',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    icon: AlertOctagon,
    iconColor: 'text-rose-400',
    barColor: 'bg-rose-500',
  },
  high: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    barColor: 'bg-amber-500',
  },
  medium: {
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    icon: Info,
    iconColor: 'text-blue-400',
    barColor: 'bg-blue-500',
  },
}

const typeIcons: Record<string, React.ElementType> = {
  'Queue Manager': Server,
  'Application': Layout,
  'Channel Group': GitBranch,
  'Object Group': GitBranch,
}

export default function HotspotPanel({ items }: HotspotPanelProps) {
  const totalContribution = items.reduce((acc, h) => acc + h.contribution, 0)

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">Complexity Drivers & Hotspots</h2>
            <p className="text-[11px] text-slate-500">Top contributors to as-is MTCS score</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-black text-rose-400 tabular-nums">{totalContribution.toFixed(1)}%</div>
          <div className="text-[9px] text-slate-600 uppercase tracking-wider">Total Contribution</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {items.map((hotspot, i) => {
          const cfg = severityConfig[hotspot.severity]
          const SevIcon = cfg.icon
          const TypeIcon = typeIcons[hotspot.type] || Server
          return (
            <motion.div
              key={hotspot.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 group`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <SevIcon className={`w-4 h-4 ${cfg.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-[12px] font-bold text-white">{hotspot.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                      <SevIcon className="w-2.5 h-2.5" />
                      {hotspot.severity.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 px-1.5 py-0.5 rounded border border-slate-700/50 bg-slate-800/40">
                      <TypeIcon className="w-2.5 h-2.5" />
                      {hotspot.type}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-slate-300 mb-2">{hotspot.issue}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{hotspot.detail}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-slate-600 uppercase tracking-wider">Complexity Contribution</span>
                        <span className="text-[10px] font-black text-slate-300 font-mono">{hotspot.contribution}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${cfg.barColor} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(hotspot.contribution / (items[0]?.contribution || 1)) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.07 + 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
