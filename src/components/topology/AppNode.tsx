import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { AppWindow, AlertTriangle } from 'lucide-react'
import type { AppNodeData } from '../../data/topologyData'

const roleColors = {
  Producer: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Consumer: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Mixed: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
}

const riskBorder = {
  high: 'border-rose-500/50 shadow-rose-500/10',
  medium: 'border-amber-500/30 shadow-amber-500/5',
  low: 'border-slate-700/60',
  none: 'border-slate-700/60',
}

interface AppNodeProps {
  data: AppNodeData
  selected: boolean
}

export default memo(function AppNode({ data, selected }: AppNodeProps) {
  return (
    <div
      className={`relative bg-[#111827] border rounded-xl px-3.5 py-3 min-w-[160px] cursor-pointer transition-all duration-200 shadow-lg group
        ${selected ? 'border-blue-400/80 shadow-blue-400/20 ring-1 ring-blue-400/30' : riskBorder[data.risk]}
        hover:border-blue-400/50 hover:shadow-blue-400/10`}
    >
      <Handle type="source" position={Position.Right} className="!bg-blue-500 !border-2 !border-[#111827] !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !border-2 !border-[#111827] !w-3 !h-3" />

      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
          ${data.risk === 'high' ? 'bg-rose-500/15 border border-rose-500/30' : 'bg-blue-500/10 border border-blue-500/20'}`}>
          <AppWindow className={`w-3.5 h-3.5 ${data.risk === 'high' ? 'text-rose-400' : 'text-blue-400'}`} />
        </div>
        <span className="text-[11px] font-mono font-semibold text-white truncate max-w-[100px]">{data.label}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${roleColors[data.role]}`}>
          {data.role}
        </span>
        <span className="text-[9px] font-mono text-slate-500">{data.connections} conns</span>
        {data.risk === 'high' && (
          <AlertTriangle className="w-3 h-3 text-rose-400 ml-auto" />
        )}
      </div>

      {selected && (
        <div className="absolute -top-0.5 -left-0.5 -right-0.5 -bottom-0.5 rounded-xl border border-blue-400/40 pointer-events-none" />
      )}
    </div>
  )
})
