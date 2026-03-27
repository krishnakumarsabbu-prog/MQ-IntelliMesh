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
import { useIngest } from '../context/IngestContext'

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
  const { status, result, isReady } = useIngest()

  const liveMetrics: MetricDef[] = isReady && result
    ? staticMetrics.map(m => {
        if (m.label === 'Applications') return { ...m, realValue: result.applications }
        if (m.label === 'Queue Managers') return { ...m, realValue: result.queue_managers }
        if (m.label === 'Channels') return { ...m, realValue: result.channels }
        return { ...m, realValue: undefined }
      })
    : staticMetrics.map(m => ({ ...m, realValue: undefined }))

  const readinessItems = baseReadinessItems.map((item, i) =>
    i === 0 ? { ...item, done: isReady } : item
  )

  const isIngesting = status === 'uploading' || status === 'processing'

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0B1020] border border-slate-800/60 p-8 mb-6"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl translate-y-1/2" />
        </div>

        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            {isReady ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-400">Topology Dataset Loaded</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-400">AI Transformation Engine Ready</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">MQ IntelliMesh</h1>
          <p className="text-lg font-medium text-blue-400 mb-3">
            AI-Powered MQ Topology Transformation &amp; Automation Platform
          </p>
          <p className="text-[14px] text-slate-400 leading-relaxed mb-6 max-w-xl">
            Transform complex IBM MQ estates into simplified, explainable, automation-ready target architectures.
            Detect anomalies, quantify complexity, and export production-grade automation artifacts.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUpload(v => !v)}
              disabled={isIngesting}
              className={
                "flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed " +
                (isReady ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20")
              }
            >
              {isReady ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {isReady ? "Dataset Loaded" : (showUpload ? "Close Upload Panel" : "Upload Topology")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold rounded-xl transition-all"
            >
              <Play className="w-4 h-4" />
              Run Transformation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700/80 border border-slate-600/40 text-slate-300 text-sm font-semibold rounded-xl transition-all"
            >
              <Database className="w-4 h-4" />
              View Demo Dataset
            </motion.button>
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
              {isReady && result
                ? "Ingested: " + result.queue_managers + " QMs · " + result.queues + " queues · " + result.applications + " apps · " + result.channels + " channels"
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
              { label: "Queue Managers", current: isReady && result ? result.queue_managers : 47, target: 28, color: "bg-blue-500" },
              { label: "Active Channels", current: isReady && result ? result.channels : 312, target: 189, color: "bg-cyan-500" },
              { label: "Policy Violations", current: 18, target: 0, color: "bg-rose-500" },
              { label: "Cross-QM Dependencies", current: isReady && result ? result.applications : 134, target: 51, color: "bg-amber-500" },
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
