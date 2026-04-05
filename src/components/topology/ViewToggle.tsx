import { GitFork, Network } from 'lucide-react'

export type TopologyView = 'canvas' | 'graph'

interface ViewToggleProps {
  view: TopologyView
  onChange: (view: TopologyView) => void
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
      <button
        onClick={() => onChange('canvas')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
          view === 'canvas'
            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
            : 'text-slate-500 hover:text-slate-300 border border-transparent'
        }`}
      >
        <GitFork className="w-3 h-3" />
        Canvas
      </button>
      <button
        onClick={() => onChange('graph')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
          view === 'graph'
            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
            : 'text-slate-500 hover:text-slate-300 border border-transparent'
        }`}
      >
        <Network className="w-3 h-3" />
        Network
      </button>
    </div>
  )
}
