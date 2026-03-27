import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileSpreadsheet, FileJson, FileCode2, FileText, BookOpen, Package, Download, RotateCcw, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { artifacts } from '../../data/exportsData'
import type { Artifact, ArtifactCategory } from '../../data/exportsData'

const filterCategories: ArtifactCategory[] = ['CSV', 'JSON', 'YAML', 'Reports', 'Docs', 'Automation']

const artifactIcons: Record<string, React.ElementType> = {
  'ART-001': FileSpreadsheet,
  'ART-002': FileJson,
  'ART-003': FileCode2,
  'ART-004': FileJson,
  'ART-005': BookOpen,
  'ART-006': FileText,
  'ART-007': Package,
  'ART-008': BookOpen,
}

const artifactColors: Record<string, { icon: string; bg: string; border: string }> = {
  'ART-001': { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'ART-002': { icon: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'ART-003': { icon: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  'ART-004': { icon: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  'ART-005': { icon: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  'ART-006': { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'ART-007': { icon: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'ART-008': { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

const statusConfig = {
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  review: { label: 'Needs Review', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertCircle },
  generated: { label: 'Generated', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock },
}

interface ArtifactLibraryProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

function ArtifactCard({ artifact, isSelected, onSelect }: { artifact: Artifact; isSelected: boolean; onSelect: () => void }) {
  const Icon = artifactIcons[artifact.id] || FileText
  const colors = artifactColors[artifact.id] || { icon: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' }
  const status = statusConfig[artifact.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-500/8 border-blue-500/30 ring-1 ring-blue-500/15'
          : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700/60'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-[12px] font-semibold leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>{artifact.name}</h3>
            <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${status.bg} ${status.border} ${status.color}`}>
              <StatusIcon className="w-2.5 h-2.5" />
              {status.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1 leading-relaxed line-clamp-2">{artifact.description}</p>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {artifact.formats.map(f => (
              <span key={f} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40 text-slate-500 font-mono">
                {f}
              </span>
            ))}
            <span className="text-[9px] font-mono text-slate-700 ml-auto">{artifact.size}</span>
          </div>
        </div>
      </div>

      <div className={`mt-3 pt-3 border-t border-slate-800/40 flex items-center gap-2 transition-all ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={e => { e.stopPropagation(); onSelect() }}
          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-blue-300 hover:border-blue-500/30 transition-all"
        >
          <Eye className="w-3 h-3" />
          Preview
        </button>
        {artifact.status === 'ready' && (
          <button
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 transition-all"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        )}
        <button
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-slate-800/40 border border-slate-700/30 text-slate-600 hover:text-slate-400 transition-all ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Regenerate
        </button>
      </div>
    </motion.div>
  )
}

export default function ArtifactLibrary({ selectedId, onSelect }: ArtifactLibraryProps) {
  const [activeFilter, setActiveFilter] = useState<ArtifactCategory | 'All'>('All')

  const filtered = activeFilter === 'All'
    ? artifacts
    : artifacts.filter(a => a.categories.includes(activeFilter))

  const readyCount = artifacts.filter(a => a.status === 'ready').length

  return (
    <div className="bg-[#0D1117] border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/50">
        <div>
          <h2 className="text-[14px] font-semibold text-white">Artifact Library</h2>
          <p className="text-[11px] text-slate-600 mt-0.5">{readyCount} of {artifacts.length} ready for export</p>
        </div>
        <button className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all font-medium">
          <Download className="w-3.5 h-3.5" />
          Export All
        </button>
      </div>

      <div className="px-4 py-2.5 border-b border-slate-800/40 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveFilter('All')}
          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
            activeFilter === 'All'
              ? 'bg-slate-700/60 border-slate-600/50 text-white'
              : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300'
          }`}
        >
          All ({artifacts.length})
        </button>
        {filterCategories.map(cat => {
          const count = artifacts.filter(a => a.categories.includes(cat)).length
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                activeFilter === cat
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat} <span className="opacity-50">({count})</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 580 }}>
        <AnimatePresence mode="popLayout">
          {filtered.map(a => (
            <ArtifactCard
              key={a.id}
              artifact={a}
              isSelected={selectedId === a.id}
              onSelect={() => onSelect(a.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
