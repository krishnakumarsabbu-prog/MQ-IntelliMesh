import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Database,
  Heart,
  BarChart3,
  AppWindow,
  Server,
  ArrowLeftRight,
  ShieldAlert,
  ArrowRight,
  GitBranch,
  AlertOctagon,
  Repeat,
  Unlink,
  Router,
  Upload,
  CheckCircle2,
  X,
  BrainCircuit,
  Sparkles,
  PackageCheck,
  TrendingDown,
  Zap,
} from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import MetricCard from '../components/ui/MetricCard'
import AlertItem from '../components/ui/AlertItem'
import ProgressCard from '../components/ui/ProgressCard'
import AIInsightCard from '../components/ui/AIInsightCard'
import VideoPlaceholder from '../components/ui/VideoPlaceholder'
import MiniTopologyPreview from '../components/ui/MiniTopologyPreview'
import UploadTopologyPanel from '../components/ingest/UploadTopologyPanel'
import IngestResultsPanel from '../components/ingest/IngestResultsPanel'
import AnalysisTriggerPanel from '../components/analysis/AnalysisTriggerPanel'
import AnalysisSummaryPanel from '../components/analysis/AnalysisSummaryPanel'
import { useIngest } from '../context/IngestContext'
import { useAnalysis } from '../context/AnalysisContext'

const staticMetrics = [
  {
    label: 'MQ Health Score',
    value: '74',
    delta: '+3 pts',
    deltaType: 'up' as const,
    hint: 'vs. last scan: 71',
    icon: Heart,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
  },
  {
    label: 'Complexity Score',
    value: '68',
    delta: '-5 pts',
    deltaType: 'down' as const,
    hint: 'target: ≤40',
    icon: BarChart3,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
  {
    label: 'Applications',
    value: '134',
    delta: '+12',
    deltaType: 'up' as const,
    hint: '28 high-dependency',
    icon: AppWindow,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    label: 'Queue Managers',
    value: '47',
    delta: 'stable',
    deltaType: 'neutral' as const,
    hint: '6 flagged as hubs',
    icon: Server,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
  {
    label: 'Channels',
    value: '312',
    delta: '+18',
    deltaType: 'up' as const,
    hint: '71 unused/idle',
    icon: ArrowLeftRight,
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-700/30',
  },
  {
    label: 'Policy Violations',
    value: '18',
    delta: '+5',
    deltaType: 'up' as const,
    hint: '3 critical, 8 high',
    icon: ShieldAlert,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
  },
]

const findings = [
  { message: 'Policy violations detected', count: 18, severity: 'critical' as const, icon: AlertOctagon, timestamp: '2m ago' },
  { message: 'Redundant channels identified', count: 7, severity: 'warning' as const, icon: ArrowLeftRight, timestamp: '4m ago' },
  { message: 'Topology cycles found', count: 5, severity: 'critical' as const, icon: Repeat, timestamp: '4m ago' },
  { message: 'Orphan objects surfaced', count: 11, severity: 'warning' as const, icon: Unlink, timestamp: '6m ago' },
  { message: 'High-risk hubs flagged', count: 3, severity: 'critical' as const, icon: Router, timestamp: '8m ago' },
]

const baseReadinessItems = [
  { label: 'Topology inventory complete', done: false },
  { label: 'Structural risks identified', done: true },
  { label: 'Optimization candidates available', done: true },
  { label: 'Export pipeline ready', done: true },
  { label: 'Transformation plan approved', done: false },
]

const aiInsights = [
  {
    title: 'Consolidate high fan-out queue managers',
    description: 'HUB-QM-01 and HUB-QM-02 serve 47 downstream apps. Merging reduces channel count by ~38%.',
    impact: 'high' as const,
    category: 'topology.consolidation',
  },
  {
    title: 'Remove unused inter-manager channels',
    description: '71 channels have zero traffic in the last 30 days. Removing them reduces complexity by 23%.',
    impact: 'high' as const,
    category: 'channel.cleanup',
  },
  {
    title: 'Standardize producer routing via remoteQ patterns',
    description: 'Direct producer-to-QM bindings in 28 applications create tight coupling. RemoteQ abstraction recommended.',
    impact: 'medium' as const,
    category: 'routing.patterns',
  },
  {
    title: 'Reduce multi-QM application dependencies',
    description: '14 applications connect to 3+ queue managers. Centralizing through a gateway QM simplifies ownership.',
    impact: 'medium' as const,
    category: 'dependency.reduction',
  },
  {
    title: 'Apply naming convention standardization',
    description: '5 different queue naming patterns detected. Uniformity reduces operational errors and aids automation.',
    impact: 'low' as const,
    category: 'governance.standards',
  },
]

type MetricDef = (typeof staticMetrics)[0] & { realValue?: number }

function LiveMetricCard({ realValue, delay, ...rest }: MetricDef & { delay?: number }) {
  if (realValue !== undefined && realValue > 0) {
    return <MetricCard {...rest} value={realValue.toLocaleString()} delta={undefined} hint="from ingested dataset" delay={delay} />
  }
  return <MetricCard {...rest} delay={delay} />
}

export default function Dashboard() {
  const [showUpload, setShowUpload] = useState(false)
  const [showAnalyze, setShowAnalyze] = useState(false)
  const { status: ingestStatus, result: ingestResult, isReady } = useIngest()
  const { isAnalyzed, result: analysisResult, healthScore, totalFindings, status: analysisStatus } = useAnalysis()

  const liveMetrics: MetricDef[] = (() => {
    if (isAnalyzed && analysisResult) {
      return staticMetrics.map(m => {
        if (m.label === 'MQ Health Score') return { ...m, realValue: analysisResult.health.score }
        if (m.label === 'Applications') return { ...m, realValue: analysisResult.topology_stats.applications }
        if (m.label === 'Queue Managers') return { ...m, realValue: analysisResult.topology_stats.queue_managers }
        if (m.label === 'Channels') return { ...m, realValue: analysisResult.topology_stats.channels }
        if (m.label === 'Policy Violations') return { ...m, realValue: analysisResult.summary.policy_violations }
        return { ...m, realValue: undefined }
      })
    }
    if (isReady && ingestResult) {
      return staticMetrics.map(m => {
        if (m.label === 'Applications') return { ...m, realValue: ingestResult.applications }
        if (m.label === 'Queue Managers') return { ...m, realValue: ingestResult.queue_managers }
        if (m.label === 'Channels') return { ...m, realValue: ingestResult.channels }
        return { ...m, realValue: undefined }
      })
    }
    return staticMetrics.map(m => ({ ...m, realValue: undefined }))
  })()

  const readinessItems = baseReadinessItems.map((item, i) => {
    if (i === 0) return { ...item, done: isReady }
    if (i === 1) return { ...item, done: isAnalyzed }
    if (i === 2) return { ...item, done: isAnalyzed }
    return item
  })

  const isIngesting = ingestStatus === 'uploading' || ingestStatus === 'processing'
  const isAnalyzing = analysisStatus === 'running'

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-slate-800/60 mb-6"
        style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1628 40%, #080D18 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/4 blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-cyan-500/4 blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] rounded-full bg-emerald-500/3 blur-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
        </div>

        <div className="relative px-8 py-7">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <AnimatePresence mode="wait">
                  {isAnalyzed ? (
                    <motion.div
                      key="analyzed"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-[11px] font-semibold text-emerald-400">Analysis Complete — {totalFindings} findings detected</span>
                    </motion.div>
                  ) : isReady ? (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-[11px] font-semibold text-blue-300">Dataset Ingested — Run analysis to surface findings</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/30 border border-slate-700/40"
                    >
                      <Sparkles className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-400">AI Transformation Engine Ready — Upload your MQ topology to begin</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <h1 className="text-[32px] lg:text-[38px] font-black text-white mb-1.5 tracking-tight leading-tight">
                MQ IntelliMesh
              </h1>
              <p className="text-[16px] font-semibold text-blue-400 mb-3 leading-tight">
                AI-Powered MQ Topology Transformation &amp; Automation Platform
              </p>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 max-w-xl">
                Analyze your IBM MQ estate, detect structural risk and policy violations, generate a validated target-state architecture, and export automation-ready provisioning artifacts — end to end.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUpload(v => !v)}
                  disabled={isIngesting}
                  className={
                    "flex items-center gap-2 px-5 py-2.5 text-white text-[13px] font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed " +
                    (isReady
                      ? "bg-blue-600/80 border border-blue-500/40 hover:bg-blue-600 shadow-blue-500/15"
                      : "bg-blue-500 hover:bg-blue-400 shadow-blue-500/25")
                  }
                >
                  {isReady ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {isReady ? "Dataset Loaded" : showUpload ? "Close Upload" : "Upload Topology"}
                </motion.button>

                {isReady && !isAnalyzed && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAnalyze(v => !v)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    {isAnalyzing ? "Analyzing Estate…" : showAnalyze ? "Close Analysis" : "Analyze Estate"}
                  </motion.button>
                )}

                {isAnalyzed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[13px] font-bold rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Analysis Complete
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/8 hover:bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-[13px] font-bold rounded-xl transition-all"
                >
                  <Play className="w-4 h-4" />
                  Run Transformation
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-700/40 text-slate-400 text-[13px] font-bold rounded-xl transition-all"
                >
                  <Database className="w-4 h-4" />
                  View Demo Data
                </motion.button>
              </div>
            </div>

            <div className="lg:flex-shrink-0 grid grid-cols-2 gap-3 lg:w-72">
              {[
                { icon: TrendingDown, label: 'Complexity Reduction', value: '~41%', sublabel: 'Projected after transformation', color: 'text-emerald-400', bg: 'bg-emerald-500/6 border-emerald-500/15' },
                { icon: Zap, label: 'Automation Speed', value: '10×', sublabel: 'vs. manual re-architecture', color: 'text-blue-400', bg: 'bg-blue-500/6 border-blue-500/15' },
                { icon: ShieldAlert, label: 'Risk Detection', value: 'AI-led', sublabel: 'Policy & topology violations', color: 'text-amber-400', bg: 'bg-amber-500/6 border-amber-500/15' },
                { icon: PackageCheck, label: 'Delivery Artifacts', value: '13+', sublabel: 'Target-state deliverables', color: 'text-cyan-400', bg: 'bg-cyan-500/6 border-cyan-500/15' },
              ].map((kpi, i) => {
                const Icon = kpi.icon
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className={`rounded-xl border px-4 py-3.5 ${kpi.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${kpi.color} mb-2`} />
                    <div className={`text-[22px] font-black tabular-nums leading-none ${kpi.color}`}>{kpi.value}</div>
                    <div className="text-[11px] font-semibold text-slate-300 mt-1">{kpi.label}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">{kpi.sublabel}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showUpload && !isReady && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mb-6 overflow-hidden"
          >
            <div className="relative">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <UploadTopologyPanel onSuccess={() => setShowUpload(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <IngestResultsPanel onReingest={() => setShowUpload(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnalyze && isReady && !isAnalyzed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mb-6 overflow-hidden"
          >
            <div className="relative">
              <button
                onClick={() => setShowAnalyze(false)}
                className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <AnalysisTriggerPanel onComplete={() => setShowAnalyze(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAnalyzed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <AnalysisSummaryPanel onReanalyze={() => setShowAnalyze(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {liveMetrics.map((m, i) => (
          <LiveMetricCard key={m.label} {...m} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-2 bg-[#111827] border border-slate-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-white">Recent Findings</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Latest intelligence from topology scan</p>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 transition-colors font-medium">
              <span>View all findings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {findings.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.4 }}
              >
                <AlertItem {...f} />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px] text-slate-600 font-mono">
              {isAnalyzed && analysisResult
                ? "Analysis: " + analysisResult.topology_stats.queue_managers + " QMs · " + analysisResult.topology_stats.queues + " queues · " + analysisResult.topology_stats.applications + " apps · " + totalFindings + " findings · health " + healthScore + "%"
                : isReady && ingestResult
                ? "Ingested: " + ingestResult.queue_managers + " QMs · " + ingestResult.queues + " queues · " + ingestResult.applications + " apps · " + ingestResult.channels + " channels"
                : "Last scan: 2024-03-15 09:42:07 UTC  •  847 objects analyzed"}
            </span>
          </div>
        </div>
        <div>
          <VideoPlaceholder />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <ProgressCard
          title="Transformation Readiness"
          score={isReady ? 88 : 82}
          scoreLabel={isReady ? "Dataset Loaded — Ready to Analyze" : "Ready for Transformation"}
          description={isReady
            ? "Topology dataset ingested. Run analysis to surface findings and begin optimization."
            : "All critical pre-conditions met. Pending sign-off on transformation plan before execution."}
          items={readinessItems}
          accentColor="emerald"
        />
        <div className="xl:col-span-2">
          <AIInsightCard insights={aiInsights} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <MiniTopologyPreview />
        <div className="bg-[#111827] border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-white mb-4">Complexity Reduction Projection</h3>
          <div className="space-y-3">
            {[
              { label: "Queue Managers", current: isReady && ingestResult ? ingestResult.queue_managers : 47, target: 28, color: "bg-blue-500" },
              { label: "Active Channels", current: isReady && ingestResult ? ingestResult.channels : 312, target: 189, color: "bg-cyan-500" },
              { label: "Policy Violations", current: 18, target: 0, color: "bg-rose-500" },
              { label: "Cross-QM Dependencies", current: isReady && ingestResult ? ingestResult.applications : 134, target: 51, color: "bg-amber-500" },
            ].map((item) => {
              const safeTarget = Math.min(item.target, item.current)
              const pct = item.current > 0 ? (safeTarget / item.current) * 100 : 0
              const reduction = item.current > 0 ? Math.round(((item.current - safeTarget) / item.current) * 100) : 0
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">{item.current}</span>
                      <ArrowRight className="w-3 h-3 text-slate-700" />
                      <span className="text-[11px] font-mono text-emerald-400">{safeTarget}</span>
                      <span className="text-[10px] text-emerald-500 font-semibold">-{reduction}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={"h-full " + item.color + " rounded-full opacity-70"}
                      initial={{ width: "100%" }}
                      animate={{ width: pct + "%" }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Projected overall complexity reduction</span>
            <span className="text-[16px] font-bold text-emerald-400">~41%</span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
