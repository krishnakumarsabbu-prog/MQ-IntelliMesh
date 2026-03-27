import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'
import { Target, Sparkles, Download } from 'lucide-react'

import {
  transformationMetrics,
  beforeAfterComparison,
  diffSummary,
  transformationDecisions,
  validationChecks,
  transformationTimeline,
} from '../data/targetStateData'

import TransformationHero from '../components/targetstate/TransformationHero'
import BeforeAfterComparison from '../components/targetstate/BeforeAfterComparison'
import DiffPanel from '../components/targetstate/DiffPanel'
import DecisionPanel from '../components/targetstate/DecisionPanel'
import ValidationPanel from '../components/targetstate/ValidationPanel'
import TransformationTimeline from '../components/targetstate/TransformationTimeline'
import TargetTopologyCanvas from '../components/targetstate/TargetTopologyCanvas'
import StatusBadge from '../components/ui/StatusBadge'

export default function TargetState() {
  return (
    <div className="min-h-full bg-[#0B1020]">
      <TransformationHero metrics={transformationMetrics} />

      <div className="px-6 mb-5">
        <TransformationTimeline steps={transformationTimeline} />
      </div>

      <div className="px-6 mb-5">
        <BeforeAfterComparison data={beforeAfterComparison} />
      </div>

      <div className="px-6 mb-5">
        <div className="bg-[#0B1020] border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: 560 }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60 bg-[#0F172A]/90 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-[13px] font-semibold text-slate-200">Target-State Topology Explorer</span>
              <StatusBadge label="AI Generated" variant="ai" dot pulse />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-600">
                Clean architecture · Single-QM ownership · RemoteQ pattern enforced
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold rounded-lg transition-all"
              >
                <Download className="w-3 h-3" />
                Export
              </motion.button>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute top-3 left-3 z-10 bg-[#0F172A]/90 backdrop-blur-sm rounded-xl border border-slate-800/60 px-3 py-2.5 space-y-1.5">
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Architecture Pattern</div>
              {[
                { dot: 'bg-emerald-400', label: 'App → Single QM ownership' },
                { dot: 'bg-violet-400', label: 'Producer → RemoteQ abstraction' },
                { dot: 'bg-amber-400', label: 'XmitQ inter-QM routing' },
                { dot: 'bg-cyan-400', label: 'Consumer ← Local Queue' },
                { dot: 'bg-emerald-500', label: 'Channel — SSL enforced' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${l.dot} flex-shrink-0`} />
                  <span className="text-[9px] text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
            <ReactFlowProvider>
              <TargetTopologyCanvas />
            </ReactFlowProvider>
          </div>
        </div>
      </div>

      <div className="px-6 mb-5">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <DiffPanel items={diffSummary} />

          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-emerald-500/5 via-[#111827] to-[#111827] border border-emerald-500/15 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-[14px] font-semibold text-white">Transformation Impact Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'QMs Eliminated', value: '19', color: 'text-rose-400', hint: '47 → 28' },
                  { label: 'Channels Removed', value: '123', color: 'text-rose-400', hint: '312 → 189' },
                  { label: 'Apps Rationalized', value: '11', color: 'text-emerald-400', hint: 'single-QM ownership' },
                  { label: 'Patterns Applied', value: '8', color: 'text-violet-400', hint: 'remoteQ standard' },
                  { label: 'Violations Cleared', value: '18', color: 'text-emerald-400', hint: 'was 18, now 0' },
                  { label: 'XmitQs Introduced', value: '6', color: 'text-amber-400', hint: 'standard routing' },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                    <div className={`text-xl font-black tabular-nums ${s.color}`}>{s.value}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">{s.label}</div>
                    <div className="text-[9px] text-slate-600 font-mono mt-0.5">{s.hint}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#111827] border border-slate-800/60 rounded-2xl p-5 flex-1"
            >
              <h3 className="text-[14px] font-semibold text-white mb-4">Architecture Principles Applied</h3>
              <div className="space-y-2.5">
                {[
                  { principle: 'Single-QM application ownership', status: 'enforced', detail: '11 apps rationalized' },
                  { principle: 'Producer remoteQ abstraction', status: 'enforced', detail: '8 apps migrated' },
                  { principle: 'Consumer local-queue reads only', status: 'enforced', detail: 'zero cross-QM reads' },
                  { principle: 'XmitQ-based inter-QM routing', status: 'enforced', detail: '6 xmitQs created' },
                  { principle: 'SSL/TLS on all channels', status: 'enforced', detail: '100% coverage' },
                  { principle: 'Deterministic naming convention', status: 'enforced', detail: 'OBJTYPE.DOMAIN.NAME' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-800/40 last:border-0">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[12px] text-slate-300">{p.principle}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-mono text-emerald-400/80">{p.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-5">
        <DecisionPanel decisions={transformationDecisions} />
      </div>

      <div className="px-6 pb-6">
        <ValidationPanel checks={validationChecks} />
      </div>
    </div>
  )
}
