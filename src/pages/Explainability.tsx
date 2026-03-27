import { motion } from 'framer-motion'
import { BrainCircuit, Sparkles, ArrowRight, GitMerge, Server, ArrowLeftRight } from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import StatusBadge from '../components/ui/StatusBadge'

const decisions = [
  {
    id: 'D-001',
    action: 'Merge HUB-QM-01 and HUB-QM-02 into CORE-QM-01',
    type: 'Consolidation',
    confidence: 94,
    rationale: 'Both queue managers share 68% of their downstream consumer applications. Merging eliminates redundant channel pairs, reduces operational overhead, and creates a single authoritative hub with improved observability.',
    impact: 'Removes 2 QMs, 42 channels, 24 redundant queues. Affects 18 apps — all validated for compatibility.',
    icon: GitMerge,
  },
  {
    id: 'D-002',
    action: 'Consolidate SVC-QM-01, SVC-QM-02, SVC-QM-03 into SVC-QM-POOL',
    type: 'Consolidation',
    confidence: 88,
    rationale: 'Three service queue managers with low utilization (avg. 23%) and overlapping service ownership. Pool pattern reduces total QM count while maintaining service isolation through queue namespacing.',
    impact: 'Removes 2 QMs. Queue count reduced from 36 to 28. Channel reduction of 14.',
    icon: Server,
  },
  {
    id: 'D-003',
    action: 'Remove 71 idle channels with zero 30-day traffic',
    type: 'Cleanup',
    confidence: 97,
    rationale: 'Channels with sustained zero traffic represent configuration debt. Validated against application manifests — none are seasonal or batch-only. Safe to remove.',
    impact: 'Reduces channel surface area by 23%. Simplifies topology scan and channel monitoring.',
    icon: ArrowLeftRight,
  },
  {
    id: 'D-004',
    action: 'Introduce remoteQ abstraction for 28 direct-binding applications',
    type: 'Refactoring',
    confidence: 79,
    rationale: 'Applications directly referencing queue manager connection factories create tight coupling. RemoteQ patterns provide location transparency and enable future hub migrations without application changes.',
    impact: 'Affects 28 applications. Requires application config change — no code modification required.',
    icon: ArrowRight,
  },
]

export default function Explainability() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Explainability</h2>
          <p className="text-[13px] text-slate-500 mt-1">AI decision transparency — every transformation explained and justified</p>
        </div>
        <StatusBadge label="AI Reasoning Engine" variant="ai" dot pulse />
      </div>

      <div className="bg-gradient-to-r from-violet-500/5 via-[#111827] to-[#111827] border border-violet-500/20 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="w-5 h-5 text-violet-400" />
          <h3 className="text-[14px] font-semibold text-white">How the AI Makes Decisions</h3>
        </div>
        <p className="text-[13px] text-slate-400 leading-relaxed max-w-3xl">
          MQ IntelliMesh uses a graph-based topology reasoning engine that analyzes structural patterns, utilization signals, policy conformance, and architectural best practices. Every transformation decision is traceable to specific evidence and quantified confidence scores.
        </p>
      </div>

      <div className="space-y-4">
        {decisions.map((decision, i) => {
          const Icon = decision.icon
          return (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.2 }}
              className="bg-[#111827] border border-slate-800/60 rounded-xl p-5 hover:border-violet-500/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <span className="font-mono text-[11px] text-slate-600">{decision.id}</span>
                    <StatusBadge label={decision.type} variant="ai" />
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span className="text-[11px] font-semibold text-violet-300">{decision.confidence}% confidence</span>
                    </div>
                  </div>
                  <h3 className="text-[14px] font-semibold text-white mb-3">{decision.action}</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="text-[10px] font-semibold text-violet-400/70 uppercase tracking-wider mb-1.5">Rationale</div>
                      <p className="text-[12px] text-slate-400 leading-relaxed">{decision.rationale}</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider mb-1.5">Expected Impact</div>
                      <p className="text-[12px] text-slate-400 leading-relaxed">{decision.impact}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-600">AI Confidence</span>
                      <span className="text-[10px] font-mono text-slate-500">{decision.confidence}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-blue-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${decision.confidence}%` }}
                        transition={{ duration: 1, delay: i * 0.08 + 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </PageContainer>
  )
}
