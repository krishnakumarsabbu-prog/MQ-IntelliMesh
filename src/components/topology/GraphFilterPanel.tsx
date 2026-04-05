import { useState } from 'react'
import { Search, X, RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp, Save, FolderOpen } from 'lucide-react'
import type { GraphFilters } from '../../lib/graphTransformer'

interface GraphFilterPanelProps {
  filters: GraphFilters
  onChange: (filters: GraphFilters) => void
  onReset: () => void
  availableRegions: string[]
}

const SAVED_PRESETS_KEY = 'mq-graph-filter-presets'

interface FilterPreset {
  name: string
  filters: GraphFilters
  savedAt: string
}

function loadPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(SAVED_PRESETS_KEY)
    return raw ? (JSON.parse(raw) as FilterPreset[]) : []
  } catch {
    return []
  }
}

function savePresets(presets: FilterPreset[]) {
  localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(presets))
}

export default function GraphFilterPanel({
  filters,
  onChange,
  onReset,
  availableRegions,
}: GraphFilterPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [presets, setPresets] = useState<FilterPreset[]>(loadPresets)
  const [showPresets, setShowPresets] = useState(false)
  const [presetName, setPresetName] = useState('')

  const set = <K extends keyof GraphFilters>(key: K, value: GraphFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const activeFilterCount = [
    filters.search !== '',
    filters.nodeType !== 'all',
    filters.queueSubtype !== 'all',
    filters.risk !== 'all',
    filters.showViolationsOnly,
    filters.showOrphansOnly,
    filters.edgeType !== 'all',
    filters.region !== 'all',
    filters.role !== 'all',
  ].filter(Boolean).length

  const handleSavePreset = () => {
    if (!presetName.trim()) return
    const newPreset: FilterPreset = {
      name: presetName.trim(),
      filters: { ...filters },
      savedAt: new Date().toISOString(),
    }
    const updated = [...presets.filter((p) => p.name !== newPreset.name), newPreset]
    setPresets(updated)
    savePresets(updated)
    setPresetName('')
  }

  const handleLoadPreset = (preset: FilterPreset) => {
    onChange(preset.filters)
    setShowPresets(false)
  }

  const handleDeletePreset = (name: string) => {
    const updated = presets.filter((p) => p.name !== name)
    setPresets(updated)
    savePresets(updated)
  }

  const btnBase = 'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer'
  const btnActive = `${btnBase} bg-blue-500/15 border-blue-500/40 text-blue-300`
  const btnInactive = `${btnBase} bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600`
  const toggleActive = `${btnBase} bg-rose-500/10 border-rose-500/30 text-rose-300`

  return (
    <div className="border-b border-slate-800/60 bg-[#0F172A]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
        <div className="relative flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search nodes…"
            className="pl-7 pr-7 py-1 text-[12px] bg-slate-800/50 border border-slate-700/40 rounded-md text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/40 w-44"
          />
          {filters.search && (
            <button
              onClick={() => set('search', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'app', 'queueManager', 'queue'] as const).map((t) => (
            <button
              key={t}
              onClick={() => set('nodeType', t)}
              className={filters.nodeType === t ? btnActive : btnInactive}
            >
              {t === 'all' ? 'All' : t === 'app' ? 'Apps' : t === 'queueManager' ? 'QMs' : 'Queues'}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-slate-700/50" />

        <div className="flex items-center gap-1">
          {(['all', 'high', 'medium', 'low'] as const).map((r) => (
            <button
              key={r}
              onClick={() => set('risk', r)}
              className={
                filters.risk === r
                  ? r === 'all'
                    ? btnActive
                    : r === 'high'
                    ? `${btnBase} bg-rose-500/10 border-rose-500/30 text-rose-300`
                    : r === 'medium'
                    ? `${btnBase} bg-amber-500/10 border-amber-500/30 text-amber-300`
                    : `${btnBase} bg-emerald-500/10 border-emerald-500/30 text-emerald-300`
                  : btnInactive
              }
            >
              {r === 'all' ? 'All Risk' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-slate-700/50" />

        <button
          onClick={() => set('showViolationsOnly', !filters.showViolationsOnly)}
          className={filters.showViolationsOnly ? toggleActive : btnInactive}
        >
          Violations
        </button>
        <button
          onClick={() => set('showOrphansOnly', !filters.showOrphansOnly)}
          className={filters.showOrphansOnly ? toggleActive : btnInactive}
        >
          Orphans
        </button>

        <div className="w-px h-4 bg-slate-700/50" />

        <button
          onClick={() => setExpanded(!expanded)}
          className={`${btnBase} flex items-center gap-1.5 ${expanded ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600'}`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          More
          {activeFilterCount > 0 && (
            <span className="px-1 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-300 font-bold">
              {activeFilterCount}
            </span>
          )}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`${btnBase} flex items-center gap-1.5 bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600`}
            title="Manage filter presets"
          >
            <FolderOpen className="w-3 h-3" />
            Presets
          </button>
          <button
            onClick={onReset}
            className={`${btnBase} flex items-center gap-1.5 bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600`}
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-t border-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Queue type</span>
            <div className="flex items-center gap-1">
              {(['all', 'local', 'remote', 'xmitq'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => set('queueSubtype', s)}
                  className={filters.queueSubtype === s ? btnActive : btnInactive}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-slate-700/50" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Edge type</span>
            <div className="flex items-center gap-1">
              {(['all', 'active', 'idle', 'risky'] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => set('edgeType', e)}
                  className={
                    filters.edgeType === e
                      ? e === 'risky'
                        ? `${btnBase} bg-rose-500/10 border-rose-500/30 text-rose-300`
                        : e === 'idle'
                        ? `${btnBase} bg-slate-700/40 border-slate-600/40 text-slate-300`
                        : btnActive
                      : btnInactive
                  }
                >
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {availableRegions.length > 0 && (
            <>
              <div className="w-px h-4 bg-slate-700/50" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Region</span>
                <select
                  value={filters.region}
                  onChange={(e) => set('region', e.target.value)}
                  className="px-2 py-1 text-[11px] bg-slate-800/50 border border-slate-700/40 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/40 cursor-pointer"
                >
                  <option value="all">All Regions</option>
                  {availableRegions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="w-px h-4 bg-slate-700/50" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">App role</span>
            <div className="flex items-center gap-1">
              {(['all', 'Producer', 'Consumer', 'Mixed'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => set('role', r)}
                  className={filters.role === r ? btnActive : btnInactive}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPresets && (
        <div className="px-4 py-3 border-t border-slate-800/40 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              placeholder="Preset name…"
              className="flex-1 px-2.5 py-1 text-[12px] bg-slate-800/50 border border-slate-700/40 rounded-md text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/40"
            />
            <button
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              className={`${btnBase} flex items-center gap-1.5 ${presetName.trim() ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25' : 'bg-slate-800/20 border-slate-700/20 text-slate-600 cursor-not-allowed'}`}
            >
              <Save className="w-3 h-3" />
              Save current
            </button>
          </div>

          {presets.length === 0 ? (
            <div className="text-[11px] text-slate-600">No saved presets yet. Apply filters and save above.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <div
                  key={preset.name}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/40 border border-slate-700/40"
                >
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.name)}
                    className="text-slate-600 hover:text-rose-400 transition-colors ml-1"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
