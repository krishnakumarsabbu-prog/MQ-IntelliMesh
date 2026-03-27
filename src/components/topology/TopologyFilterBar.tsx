import { Search, X, Maximize2, ScanLine, Camera, RotateCcw } from 'lucide-react'

export interface TopologyFilters {
  search: string
  nodeType: 'all' | 'app' | 'queueManager' | 'queue'
  queueSubtype: 'all' | 'local' | 'remote' | 'xmitq'
  risk: 'all' | 'high' | 'medium' | 'low'
  showViolationsOnly: boolean
  showOrphansOnly: boolean
}

interface TopologyFilterBarProps {
  filters: TopologyFilters
  onChange: (f: TopologyFilters) => void
  onFitView: () => void
  onCenter: () => void
  onReset: () => void
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
        active
          ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
          : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600/60'
      }`}
    >
      {label}
    </button>
  )
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border flex items-center gap-1.5 ${
        active
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600/60'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-rose-400' : 'bg-slate-600'}`} />
      {label}
    </button>
  )
}

export default function TopologyFilterBar({ filters, onChange, onFitView, onCenter, onReset }: TopologyFilterBarProps) {
  const update = (partial: Partial<TopologyFilters>) => onChange({ ...filters, ...partial })

  return (
    <div className="flex items-center gap-3 flex-wrap px-4 py-3 bg-[#0F172A] border-b border-slate-800/60">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search nodes..."
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-8 pr-8 py-1.5 text-[12px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 w-44 transition-all"
        />
        {filters.search && (
          <button onClick={() => update({ search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3 h-3 text-slate-500 hover:text-slate-300" />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-slate-800" />

      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-600 mr-1">Type:</span>
        {(['all', 'app', 'queueManager', 'queue'] as const).map((t) => (
          <FilterChip
            key={t}
            label={t === 'all' ? 'All' : t === 'app' ? 'Apps' : t === 'queueManager' ? 'QMs' : 'Queues'}
            active={filters.nodeType === t}
            onClick={() => update({ nodeType: t })}
          />
        ))}
      </div>

      <div className="w-px h-5 bg-slate-800" />

      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-600 mr-1">Queue:</span>
        {(['all', 'local', 'remote', 'xmitq'] as const).map((t) => (
          <FilterChip
            key={t}
            label={t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            active={filters.queueSubtype === t}
            onClick={() => update({ queueSubtype: t })}
          />
        ))}
      </div>

      <div className="w-px h-5 bg-slate-800" />

      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-600 mr-1">Risk:</span>
        {(['all', 'high', 'medium', 'low'] as const).map((r) => (
          <FilterChip
            key={r}
            label={r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            active={filters.risk === r}
            onClick={() => update({ risk: r })}
          />
        ))}
      </div>

      <div className="w-px h-5 bg-slate-800" />

      <div className="flex items-center gap-1">
        <ToggleChip label="Violations" active={filters.showViolationsOnly} onClick={() => update({ showViolationsOnly: !filters.showViolationsOnly })} />
        <ToggleChip label="Orphans" active={filters.showOrphansOnly} onClick={() => update({ showOrphansOnly: !filters.showOrphansOnly })} />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
        <button
          onClick={onFitView}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 transition-all"
        >
          <Maximize2 className="w-3 h-3" />
          Fit View
        </button>
        <button
          onClick={onCenter}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 transition-all"
        >
          <ScanLine className="w-3 h-3" />
          Center
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 transition-all">
          <Camera className="w-3 h-3" />
          Snapshot
        </button>
      </div>
    </div>
  )
}
