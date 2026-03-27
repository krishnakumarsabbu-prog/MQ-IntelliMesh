import { motion } from 'framer-motion'
import { Trash2, Plus, ArrowRight, CheckCircle2, Minus } from 'lucide-react'
import type { diffSummary } from '../../data/targetStateData'

type DiffItem = typeof diffSummary[number]

interface DiffPanelProps {
  items: DiffItem[]
}

const typeConfig = {
  removed: { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/8', border: 'border-rose-500/15', badge: 'bg-rose-500/10 text-rose-400', label: 'Removed' },
  added: { icon: Plus, color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', badge: 'bg-emerald-500/10 text-emerald-400', label: 'Added' },
  changed: { icon: ArrowRight, color: 'text-cyan-400', bg: 'bg-cyan-500/8', border: 'border-cyan-500/15', badge: 'bg-cyan-500/10 text-cyan-400', label: 'Changed' },
}

const impactBadge = {
  critical: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  high: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  low: 'bg-slate-700/40 text-slate-400 border-slate-700/60',
}

function DiffLegend() {
  return (
    <div className="flex items-center gap-3">
      {(['removed', 'added', 'changed'] as const).map((t) => {
        const cfg = typeConfig[t]
        const Icon = cfg.icon
        return (
          <div key={t} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
              <Icon className={`w-3 h-3 ${cfg.color}`} />
            </div>
            <span className="text-[10px] text-slate-500">{cfg.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function DiffPanel({ items }: DiffPanelProps) {
  const removed = items.filter(i => i.type === 'removed').length
  const added = items.filter(i => i.type === 'added').length
  const changed = items.filter(i => i.type === 'changed').length

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Transformation Summary</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Change manifest — what was added, removed, or reworked</p>
        </div>
        <DiffLegend />
      </div>

      <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-800/40 bg-slate-800/20">
        <div className="flex items-center gap-1.5">
          <Minus className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[12px] font-semibold text-rose-400">{removed} removed</span>
        </div>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[12px] font-semibold text-emerald-400">{added} added</span>
        </div>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[12px] font-semibold text-cyan-400">{changed} changed</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {items.map((item, i) => {
          const cfg = typeConfig[item.type]
          const Icon = cfg.icon
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.1 }}
              className={`rounded-xl p-4 border ${cfg.border} ${cfg.bg} hover:brightness-110 transition-all group`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.badge}`}>{cfg.label.toUpperCase()}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${impactBadge[item.impact as keyof typeof impactBadge]}`}>
                      {item.impact} impact
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-white mb-1">{item.label}</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="px-5 py-3.5 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[12px] text-emerald-300 font-medium">All changes validated — zero regressions detected</span>
        </div>
      </div>
    </div>
  )
}
