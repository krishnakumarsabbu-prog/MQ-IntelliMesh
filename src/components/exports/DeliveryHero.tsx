import { motion } from 'framer-motion'
import { PackageCheck, CheckCircle2, ShieldCheck, Boxes, Cpu, Download, AlertCircle, Loader2 } from 'lucide-react'
import { useExport } from '../../context/ExportContext'
import { useIngest } from '../../context/IngestContext'
import { useAnalysis } from '../../context/AnalysisContext'

export default function DeliveryHero() {
  const { isExported, result, status: exportStatus, artifactCount } = useExport()
  const { isReady } = useIngest()
  const { isAnalyzed, healthScore } = useAnalysis()

  const isGenerating = exportStatus === 'generating'
  const summary = result?.summary as Record<string, number> | undefined

  const supportStats = isExported && summary
    ? [
        { label: 'Artifacts Generated', value: String(artifactCount), icon: Boxes, color: 'text-emerald-400' },
        { label: 'Complexity Reduction', value: `${Number(summary.complexity_reduction_percent ?? 0).toFixed(1)}%`, icon: Cpu, color: 'text-blue-400' },
        { label: 'Compliance Score', value: `${Number(summary.compliance_score ?? 0).toFixed(0)}%`, icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'QMs (Before→After)', value: `${summary.queue_managers_before ?? 0}→${summary.queue_managers_after ?? 0}`, icon: PackageCheck, color: 'text-cyan-400' },
        { label: 'Routes Generated', value: String(summary.routes_generated ?? 0), icon: ShieldCheck, color: 'text-teal-400' },
        { label: 'Analysis Findings', value: String(summary.findings_count ?? 0), icon: Download, color: 'text-amber-400' },
      ]
    : [
        { label: 'Artifacts Available', value: '13+', icon: Boxes, color: 'text-emerald-400' },
        { label: 'Automation Readiness', value: isAnalyzed ? `${healthScore}%` : '—', icon: Cpu, color: 'text-blue-400' },
        { label: 'Validation Coverage', value: isAnalyzed ? '100%' : '—', icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'Export Formats', value: '7', icon: PackageCheck, color: 'text-cyan-400' },
        { label: 'Decision Traceability', value: isAnalyzed ? 'Full' : '—', icon: ShieldCheck, color: 'text-teal-400' },
        { label: 'Changeset Complete', value: isExported ? '100%' : '—', icon: Download, color: 'text-amber-400' },
      ]

  const statusBadges = isExported
    ? [
        { label: 'Export Package Ready', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400', pulse: true },
        { label: 'Validation Passed', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400', pulse: false },
        { label: `${artifactCount} Artifacts Generated`, color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400', pulse: false },
        { label: 'Delivery Bundle Ready', color: 'text-teal-300', bg: 'bg-teal-500/10', border: 'border-teal-500/25', dot: 'bg-teal-400', pulse: true },
      ]
    : isGenerating
    ? [
        { label: 'Generating…', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400', pulse: true },
      ]
    : isAnalyzed
    ? [
        { label: 'Analysis Complete', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400', pulse: false },
        { label: 'Ready to Export', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400', pulse: true },
      ]
    : isReady
    ? [
        { label: 'Dataset Loaded', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400', pulse: false },
        { label: 'Analysis Required', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400', pulse: true },
      ]
    : [
        { label: 'Awaiting Topology Ingest', color: 'text-slate-400', bg: 'bg-slate-700/20', border: 'border-slate-700/40', dot: 'bg-slate-500', pulse: false },
      ]

  return (
    <div className="relative bg-[#0D1117] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-blue-950/20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />

      <div className="relative px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                isExported
                  ? 'bg-emerald-500/12 border-emerald-500/25'
                  : isGenerating
                  ? 'bg-amber-500/12 border-amber-500/20'
                  : 'bg-slate-700/30 border-slate-700/40'
              }`}>
                {isGenerating
                  ? <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  : isExported
                  ? <PackageCheck className="w-6 h-6 text-emerald-400" />
                  : !isReady
                  ? <AlertCircle className="w-6 h-6 text-slate-500" />
                  : !isAnalyzed
                  ? <AlertCircle className="w-6 h-6 text-amber-400" />
                  : <PackageCheck className="w-6 h-6 text-blue-400" />}
              </div>
              {isExported && (
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0D1117]"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                />
              )}
            </div>
            <div>
              <h1 className="text-[20px] font-black text-white tracking-tight">Automation Delivery Center</h1>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed max-w-2xl">
                {isExported
                  ? `Transformation artifact bundle generated — ${artifactCount} automation-ready files packaged for deployment and provisioning.`
                  : isGenerating
                  ? 'Generating target-state artifacts and packaging delivery bundle…'
                  : 'Export the validated target-state architecture as deployment-ready datasets, transformation evidence, governance reports, and provisioning-compatible automation inputs.'}
              </p>
            </div>
          </div>

          <div className="lg:ml-auto flex flex-wrap gap-2">
            {statusBadges.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 + 0.1 }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${b.bg} ${b.border} ${b.color}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${b.dot} ${b.pulse ? 'animate-pulse' : ''}`} />
                {b.label}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {supportStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 + 0.3 }}
                className="flex items-center gap-2.5 bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5"
              >
                <Icon className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
                <div>
                  <div className={`text-[15px] font-black tabular-nums leading-none ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
