import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ArrowLeftRight,
  Unlink,
  Router,
  ShieldAlert,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Loader2,
  UploadCloud,
} from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import StatusBadge from '../components/ui/StatusBadge'
import AnalysisTriggerPanel from '../components/analysis/AnalysisTriggerPanel'
import { useAnalysis } from '../context/AnalysisContext'
import { useIngest } from '../context/IngestContext'
import type { AnalysisFinding } from '../types/api'

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

function severityVariant(s: string): "critical" | "warning" | "info" | "neutral" {
  if (s === "critical" || s === "high") return "critical"
  if (s === "medium") return "warning"
  return "info"
}

function severityIcon(s: string) {
  if (s === "critical" || s === "high") return AlertOctagon
  if (s === "medium") return AlertTriangle
  return Info
}

function severityColor(s: string): string {
  if (s === "critical") return "text-rose-400"
  if (s === "high") return "text-orange-400"
  if (s === "medium") return "text-amber-400"
  return "text-blue-400"
}

function severityBg(s: string): string {
  if (s === "critical") return "bg-rose-500/10"
  if (s === "high") return "bg-orange-500/10"
  if (s === "medium") return "bg-amber-500/10"
  return "bg-blue-500/10"
}

interface FindingCardProps {
  finding: AnalysisFinding
  index: number
}

function FindingCard({ finding, index }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = severityIcon(finding.severity)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 + 0.1 }}
      className="bg-[#111827] border border-slate-800/60 rounded-xl hover:border-slate-700/80 transition-all group"
    >
      <div
        className="flex items-start gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className={"w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 " + severityBg(finding.severity)}>
          <Icon className={"w-4 h-4 " + severityColor(finding.severity)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
            <span className="font-mono text-[11px] text-slate-600">{finding.id.slice(0, 12)}</span>
            <StatusBadge label={finding.severity} variant={severityVariant(finding.severity)} />
            <StatusBadge label={finding.category.replace(/_/g, " ")} variant="neutral" />
            <span className="text-[11px] font-mono text-slate-600">{finding.subject_type}</span>
          </div>
          <h3 className="text-[14px] font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
            {finding.title}
          </h3>
          <p className="text-[12px] text-slate-500 mb-2">{finding.impact}</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
            <span className="flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" />
              {finding.subject_id}
            </span>
            <span className="flex items-center gap-1 text-blue-500/60">
              conf: {Math.round(finding.confidence * 100)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setExpanded(true) }}
            className="px-3 py-1.5 text-[12px] font-medium text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100"
          >
            Investigate
          </button>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-600" />
            : <ChevronDown className="w-4 h-4 text-slate-600" />
          }
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-800/40 pt-4 space-y-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Description</span>
                <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{finding.description}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Recommendation</span>
                <p className="text-[12px] text-emerald-400/80 mt-1 leading-relaxed">{finding.recommendation}</p>
              </div>
              {Object.keys(finding.evidence ?? {}).length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Evidence</span>
                  <div className="mt-1 grid grid-cols-2 gap-1.5">
                    {Object.entries(finding.evidence).slice(0, 6).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/40">
                        <span className="text-[10px] text-slate-600 capitalize">{k.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-auto">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const STATIC_MOCK = [
  {
    id: "F-0021-mock",
    type: "POLICY_VIOLATION",
    category: "Policy",
    severity: "critical",
    subject_type: "queue_manager",
    subject_id: "HUB-QM-01",
    title: "Policy violation: Missing dead-letter queue on HUB-QM-01",
    description: "The queue manager HUB-QM-01 does not have a dead-letter queue configured.",
    impact: "Messages may be silently discarded during backpressure events.",
    recommendation: "Configure a dead-letter queue (SYSTEM.DEAD.LETTER.QUEUE) on this queue manager.",
    evidence: {},
    confidence: 0.98,
  },
  {
    id: "F-0022-mock",
    type: "TOPOLOGY_CYCLE",
    category: "Topology",
    severity: "critical",
    subject_type: "queue_manager",
    subject_id: "HUB-QM-01",
    title: "3 topology cycles detected in cluster routing paths",
    description: "Circular routing paths detected in the message flow graph.",
    impact: "Circular routing increases latency and risks message storms.",
    recommendation: "Break cycles by introducing directional routing constraints.",
    evidence: {},
    confidence: 0.95,
  },
  {
    id: "F-0024-mock",
    type: "REDUNDANT_CHANNELS",
    category: "Optimization",
    severity: "high",
    subject_type: "channel",
    subject_id: "Multiple",
    title: "7 redundant sender-receiver channel pairs identified",
    description: "Multiple sender-receiver channel pairs serve the same routing path.",
    impact: "Redundant channels increase configuration surface area.",
    recommendation: "Consolidate redundant channel pairs into single managed connections.",
    evidence: {},
    confidence: 0.89,
  },
  {
    id: "F-0026-mock",
    type: "ORPHAN_QUEUE",
    category: "Cleanup",
    severity: "medium",
    subject_type: "queue",
    subject_id: "APP-QM-02",
    title: "11 orphaned queues with no producers or consumers",
    description: "These queues have no active producer or consumer applications.",
    impact: "Orphan objects increase scan time and administrative overhead.",
    recommendation: "Archive or remove orphaned queues after validation.",
    evidence: {},
    confidence: 0.97,
  },
]

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low"

export default function Findings() {
  const { isAnalyzed, result, status } = useAnalysis()
  const { isReady: ingestReady } = useIngest()
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")

  const isRunning = status === "running"

  const findings: AnalysisFinding[] = useMemo(() => {
    if (isAnalyzed && result?.findings && result.findings.length > 0) {
      return [...result.findings].sort((a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
      )
    }
    return STATIC_MOCK as AnalysisFinding[]
  }, [isAnalyzed, result])

  const filtered = useMemo(() => {
    let out = findings
    if (severityFilter !== "all") out = out.filter(f => f.severity === severityFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(f =>
        f.title.toLowerCase().includes(q) ||
        f.subject_id.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
      )
    }
    return out
  }, [findings, severityFilter, search])

  const critical = findings.filter(f => f.severity === "critical").length
  const high = findings.filter(f => f.severity === "high").length
  const medium = findings.filter(f => f.severity === "medium").length
  const low = findings.filter(f => f.severity === "low").length
  const policyViolations = isAnalyzed ? (result?.summary?.policy_violations ?? 0) : 18
  const hotspots = isAnalyzed ? (result?.summary?.hotspots ?? 0) : 5
  const simplification = isAnalyzed ? (result?.summary?.simplification_opportunities ?? 0) : 82

  return (
    <PageContainer>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Findings</h2>
          <p className="text-[13px] text-slate-500 mt-1">
            {isAnalyzed
              ? "Real intelligence from your ingested MQ topology analysis"
              : "Anomalies, risks, and policy violations from topology scan"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAnalyzed ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">Analysis Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[11px] font-medium text-amber-400">Demo Data</span>
            </div>
          )}
          <StatusBadge label={(critical + high) + " Critical/High"} variant="critical" dot />
          <StatusBadge label={medium + " Medium"} variant="warning" dot />
          <StatusBadge label={low + " Low"} variant="info" dot />
        </div>
      </div>

      {!ingestReady && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-4 rounded-xl bg-slate-800/40 border border-slate-700/40 mb-6"
        >
          <UploadCloud className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <div>
            <p className="text-[13px] font-medium text-slate-300">No dataset loaded</p>
            <p className="text-[12px] text-slate-600">Upload and ingest topology CSVs from the Dashboard to run real analysis.</p>
          </div>
        </motion.div>
      )}

      {ingestReady && !isAnalyzed && (
        <div className="mb-6">
          <AnalysisTriggerPanel />
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Findings", value: findings.length, icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/10" },
          { label: "Policy Violations", value: policyViolations, icon: AlertOctagon, color: "text-rose-400", bg: "bg-rose-500/10" },
          { label: "Risk Hotspots", value: hotspots, icon: Router, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Cleanup Candidates", value: simplification, icon: Unlink, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#111827] border border-slate-800/60 rounded-xl p-4 flex items-center gap-4"
            >
              <div className={"w-10 h-10 rounded-lg " + stat.bg + " flex items-center justify-center flex-shrink-0"}>
                <Icon className={"w-5 h-5 " + stat.color} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white tabular-nums">{stat.value}</div>
                <div className="text-[12px] text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search findings..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/40 border border-slate-700/50 rounded-lg text-[13px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          {(["all", "critical", "high", "medium", "low"] as SeverityFilter[]).map(sv => (
            <button
              key={sv}
              onClick={() => setSeverityFilter(sv)}
              className={"px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all " + (
                severityFilter === sv
                  ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                  : "bg-slate-800/40 border border-slate-700/40 text-slate-500 hover:text-slate-300"
              )}
            >
              {sv === "all" ? "All" : sv.charAt(0).toUpperCase() + sv.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isRunning ? (
        <div className="flex items-center justify-center gap-3 py-16">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-[14px] text-slate-400">Running topology intelligence…</span>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-400/40" />
          <p className="text-[14px] text-slate-500">No findings match your filter</p>
          <button
            onClick={() => { setSearch(""); setSeverityFilter("all") }}
            className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((finding, i) => (
            <FindingCard key={finding.id} finding={finding} index={i} />
          ))}
        </div>
      )}

      {isAnalyzed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center gap-2.5 text-[11px] text-slate-600 font-mono"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-slate-700" />
          <span>
            Real-time analysis · {findings.length} findings from dataset {result?.dataset_id?.slice(0, 16)}
          </span>
          {result?.topology_stats && (
            <span className="ml-2 text-slate-700">
              · {result.topology_stats.queue_managers} QMs · {result.topology_stats.queues} queues · {result.topology_stats.applications} apps
            </span>
          )}
        </motion.div>
      )}
    </PageContainer>
  )
}
