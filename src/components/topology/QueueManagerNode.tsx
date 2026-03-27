import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Server, ShieldAlert } from 'lucide-react'
import type { QMNodeData } from '../../data/topologyData'

const riskConfig = {
  high: { border: 'border-rose-500/50', glow: 'shadow-rose-500/20', icon: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  medium: { border: 'border-amber-500/30', glow: 'shadow-amber-500/10', icon: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  low: { border: 'border-blue-500/30', glow: 'shadow-blue-500/10', icon: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  none: { border: 'border-slate-700/60', glow: '', icon: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
}

interface QueueManagerNodeProps {
  data: QMNodeData
  selected: boolean
}

export default memo(function QueueManagerNode({ data, selected }: QueueManagerNodeProps) {
  const config = riskConfig[data.risk]

  return (
    <div
      className={`relative bg-[#0F172A] border rounded-2xl px-4 py-3.5 min-w-[190px] cursor-pointer transition-all duration-200 shadow-xl group
        ${selected ? 'border-blue-400/80 shadow-blue-400/30 ring-1 ring-blue-400/30' : `${config.border} shadow-lg ${config.glow}`}
        hover:border-blue-400/50`}
    >
      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !border-2 !border-[#0F172A] !w-3.5 !h-3.5" />
      <Handle type="target" position={Position.Left} className="!bg-cyan-400 !border-2 !border-[#0F172A] !w-3.5 !h-3.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !border-2 !border-[#0F172A] !w-3 !h-3" />
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !border-2 !border-[#0F172A] !w-3 !h-3" />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${config.bg}`}>
          <Server className={`w-4 h-4 ${config.icon}`} />
        </div>
        {data.risk === 'high' && (
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
        )}
      </div>

      <div className="mb-2">
        <div className="text-[12px] font-mono font-bold text-white truncate">{data.label}</div>
        <div className="text-[9px] text-slate-500 mt-0.5 truncate">{data.region}</div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
        <div className="text-center">
          <div className="text-[12px] font-bold text-white tabular-nums">{data.queues}</div>
          <div className="text-[8px] text-slate-600 uppercase tracking-wide">Queues</div>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div className="text-center">
          <div className="text-[12px] font-bold text-white tabular-nums">{data.channels}</div>
          <div className="text-[8px] text-slate-600 uppercase tracking-wide">Channels</div>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div className="text-center">
          <div className="text-[12px] font-bold text-white tabular-nums">{data.apps}</div>
          <div className="text-[8px] text-slate-600 uppercase tracking-wide">Apps</div>
        </div>
      </div>

      {selected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 pointer-events-none" />
      )}
    </div>
  )
})
