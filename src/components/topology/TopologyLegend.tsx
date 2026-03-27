import { AppWindow, Server, Layers, ArrowRightLeft, Send, AlertTriangle } from 'lucide-react'

const legendItems = [
  { icon: AppWindow, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Application' },
  { icon: Server, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Queue Manager' },
  { icon: Layers, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', label: 'Local Queue' },
  { icon: ArrowRightLeft, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Remote Queue' },
  { icon: Send, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'XMIT Queue' },
  { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Risk / Violation' },
]

export default function TopologyLegend() {
  return (
    <div className="bg-[#0F172A]/90 backdrop-blur-sm border border-slate-800/60 rounded-xl px-4 py-3">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Legend</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {legendItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${item.bg} border ${item.border}`}>
                <Icon className={`w-2.5 h-2.5 ${item.color}`} />
              </div>
              <span className="text-[10px] text-slate-400">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
