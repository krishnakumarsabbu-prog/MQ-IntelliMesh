import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Archive,
  BarChart3,
  ShieldCheck,
  Cpu,
} from 'lucide-react'
import { useExport } from '../../context/ExportContext'
import { getExportDownloadUrl } from '../../lib/api/export'
import type { ExportArtifact } from '../../types/api'

const ARTIFACT_TYPE_CONFIG: Record<string, {
  icon: React.ElementType
  color: string
  bg: string
  border: string
  label: string
  description: string
}> = {
  target_topology: {
    icon: FileSpreadsheet,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    label: 'Target Topology',
    description: 'Target-state MQ topology dataset',
  },
  analysis: {
    icon: BarChart3,
    color: 'text-blue-400',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    label: 'Analysis Output',
    description: 'Intelligence findings and transformation decisions',
  },
  validation: {
    icon: ShieldCheck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/20',
    label: 'Validation Report',
    description: 'Policy compliance and governance checks',
  },
  summary: {
    icon: FileJson,
    color: 'text-amber-400',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    label: 'Summary Report',
    description: 'Export and transformation summary metadata',
  },
  manifest: {
    icon: FileText,
    color: 'text-slate-400',
    bg: 'bg-slate-700/20',
    border: 'border-slate-700/40',
    label: 'Manifest',
    description: 'Package manifest and artifact index',
  },
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function ArtifactRow({ artifact, exportId, index }: { artifact: ExportArtifact; exportId: string; index: number }) {
  const typeConf = ARTIFACT_TYPE_CONFIG[artifact.type] ?? ARTIFACT_TYPE_CONFIG.summary
  const Icon = typeConf.icon

  function handleDownloadArtifact() {
    const url = getExportDownloadUrl(exportId)
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${typeConf.bg} ${typeConf.border} group`}
    >
      <div className={`w-8 h-8 rounded-lg ${typeConf.bg} border ${typeConf.border} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${typeConf.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-slate-200 truncate">{artifact.name}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${typeConf.bg} ${typeConf.border} ${typeConf.color} flex-shrink-0`}>
            {typeConf.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-slate-600">{artifact.records.toLocaleString()} records</span>
          <span className="text-[10px] text-slate-700">·</span>
          <span className="text-[10px] font-mono text-slate-600">{formatBytes(artifact.size_bytes)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownloadArtifact}
          title="Download as part of ZIP bundle"
          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg ${typeConf.bg} border ${typeConf.border} ${typeConf.color} hover:opacity-80 transition-opacity`}
        >
          <Download className="w-3 h-3" />
          Download Bundle
        </button>
      </div>

      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0" />
    </motion.div>
  )
}

function ArtifactGroupSection({ title, artifacts, exportId, startIndex }: {
  title: string
  artifacts: ExportArtifact[]
  exportId: string
  startIndex: number
}) {
  if (artifacts.length === 0) return null
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">{title}</p>
      <div className="space-y-2">
        {artifacts.map((a, i) => (
          <ArtifactRow key={a.name} artifact={a} exportId={exportId} index={startIndex + i} />
        ))}
      </div>
    </div>
  )
}

export default function ExportResultsPanel() {
  const { isExported, result, exportId, exportedAt, status } = useExport()

  if (!isExported || !result || !exportId) return null

  const topologyArtifacts = result.artifacts.filter(a => a.type === 'target_topology')
  const analysisArtifacts = result.artifacts.filter(a => a.type === 'analysis')
  const validationArtifacts = result.artifacts.filter(a => a.type === 'validation')
  const summaryArtifacts = result.artifacts.filter(a => a.type === 'summary' || a.type === 'manifest')

  const bundleUrl = getExportDownloadUrl(exportId)
  const bundleSizeStr = result.bundle ? formatBytes(result.bundle.size_bytes) : ''
  const summary = result.summary as unknown as Record<string, number | string>

  const summaryStats = [
    { label: 'Artifacts', value: result.artifact_count, icon: Package, color: 'text-emerald-400' },
    { label: 'Applications', value: summary.applications ?? 0, icon: Cpu, color: 'text-blue-400' },
    { label: 'Complexity Reduction', value: `${Number(summary.complexity_reduction_percent ?? 0).toFixed(1)}%`, icon: BarChart3, color: 'text-cyan-400' },
    { label: 'Compliance', value: `${Number(summary.compliance_score ?? 0).toFixed(0)}%`, icon: ShieldCheck, color: 'text-emerald-400' },
  ]

  return (
    <AnimatePresence>
      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="bg-[#0D1117] border border-emerald-500/20 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-emerald-500/4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-white">Transformation Package Ready</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-slate-500">{exportId}</span>
                  {exportedAt && (
                    <>
                      <span className="text-slate-700">·</span>
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-600">
                        {exportedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <a
              href={bundleUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Archive className="w-3.5 h-3.5" />
              Download ZIP
              {bundleSizeStr && <span className="text-emerald-100/70 font-normal">({bundleSizeStr})</span>}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          <div className="px-5 pt-4 grid grid-cols-4 gap-3 mb-5">
            {summaryStats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                  className="bg-slate-900/40 border border-slate-800/50 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                >
                  <Icon className={`w-4 h-4 ${s.color} flex-shrink-0`} />
                  <div>
                    <div className={`text-[16px] font-black tabular-nums leading-none ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{s.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="px-5 pb-5">
            <ArtifactGroupSection
              title="Target Topology Datasets"
              artifacts={topologyArtifacts}
              exportId={exportId}
              startIndex={0}
            />
            <ArtifactGroupSection
              title="Intelligence & Analysis Reports"
              artifacts={analysisArtifacts}
              exportId={exportId}
              startIndex={topologyArtifacts.length}
            />
            <ArtifactGroupSection
              title="Validation & Compliance"
              artifacts={validationArtifacts}
              exportId={exportId}
              startIndex={topologyArtifacts.length + analysisArtifacts.length}
            />
            <ArtifactGroupSection
              title="Summary & Manifest"
              artifacts={summaryArtifacts}
              exportId={exportId}
              startIndex={topologyArtifacts.length + analysisArtifacts.length + validationArtifacts.length}
            />

            <div className="mt-3 pt-3 border-t border-slate-800/40 flex items-center justify-between">
              <span className="text-[11px] text-slate-600">
                {result.message}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-semibold">Automation-ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
