import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Layers, ArrowRightLeft, Send, AlertTriangle } from 'lucide-react'
import type { QueueNodeData } from '../../data/topologyData'

const subtypeConfig = {
  local: {
    icon: Layers,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    label: 'Local',
  },
  remote: {
    icon: ArrowRightLeft,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    label: 'Remote',
  },
  xmitq: {
    icon: Send,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    label: 'XMITQ',
  },
}

const riskBorder = {
  high: 'border-rose-500/50',
  medium: 'border-amber-500/30',
  low: 'border-slate-700/50',
  none: 'border-slate-700/40',
}

interface QueueNodeProps {
  data: QueueNodeData
  selected: boolean
}

export default memo(function QueueNode({ data, selected }: QueueNodeProps) {
  const cfg = subtypeConfig[data.subtype]
  const Icon = cfg.icon

  const depthPct = data.depth !== undefined && data.maxDepth ? Math.min((data.depth / data.maxDepth) * 100, 100) : null

  return (
    <div
      className={`relative bg-[#111827] border rounded-lg px-3 py-2.5 min-w-[155px] cursor-pointer transition-all duration-200 shadow-md group
        ${selected ? 'border-blue-400/80 ring-1 ring-blue-400/30 shadow-blue-400/15' : riskBorder[data.risk]}
        hover:border-blue-400/40`}
    >
      <Handle type="target" position={Position.Left} className={`!border-2 !border-[#111827] !w-2.5 !h-2.5 ${data.subtype === 'xmitq' ? '!bg-amber-400' : data.subtype === 'remote' ? '!bg-violet-400' : '!bg-cyan-400'}`} />
      <Handle type="source" position={Position.Right} className={`!border-2 !border-[#111827] !w-2.5 !h-2.5 ${data.subtype === 'xmitq' ? '!bg-amber-400' : data.subtype === 'remote' ? '!bg-violet-400' : '!bg-cyan-400'}`} />

      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
          <Icon className={`w-3 h-3 ${cfg.color}`} />
        </div>
        <span className="text-[10px] font-mono font-semibold text-slate-200 truncate max-w-[100px]">{data.label}</span>
        {(data.risk === 'high' || data.risk === 'medium') && (
          <AlertTriangle className={`w-3 h-3 flex-shrink-0 ml-auto ${data.risk === 'high' ? 'text-rose-400' : 'text-amber-400'}`} />
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border ${cfg.badge}`}>{cfg.label}</span>
        {data.depth !== undefined && (
          <span className="text-[8px] font-mono text-slate-600">{data.depth.toLocaleString()}msgs</span>
        )}
      </div>

      {depthPct !== null && depthPct > 0 && (
        <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${depthPct > 70 ? 'bg-rose-500' : depthPct > 40 ? 'bg-amber-500' : 'bg-cyan-500'}`}
            style={{ width: `${depthPct}%` }}
          />
        </div>
      )}
    </div>
  )
})
