import { motion } from 'framer-motion'
import { Target, Server, ArrowLeftRight, TrendingDown, Download, CheckCircle2 } from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import StatusBadge from '../components/ui/StatusBadge'

const targetQMs = [
  { id: 'CORE-QM-01', role: 'Central Hub', queues: 42, channels: 18, apps: 31, reduction: 'Consolidated 3 hubs' },
  { id: 'APP-QM-01', role: 'Application', queues: 18, channels: 6, apps: 6, reduction: 'Unchanged' },
  { id: 'SVC-QM-POOL', role: 'Service Pool', queues: 28, channels: 8, apps: 9, reduction: 'Merged 3 SVC QMs' },
]

export default function TargetState() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Target State</h2>
          <p className="text-[13px] text-slate-500 mt-1">AI-generated optimized target architecture — 41% complexity reduction</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge label="AI Generated" variant="ai" dot pulse />
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20">
            <Download className="w-3.5 h-3.5" />
            Export Architecture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Queue Managers', before: 47, after: 28, icon: Server },
          { label: 'Active Channels', before: 312, after: 189, icon: ArrowLeftRight },
          { label: 'Complexity Score', before: 68, after: 34, icon: TrendingDown },
          { label: 'Policy Violations', before: 18, after: 0, icon: CheckCircle2 },
        ].map((item, i) => {
          const Icon = item.icon
          const pct = Math.round(((item.before - item.after) / item.before) * 100)
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#111827] border border-slate-800/60 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-slate-500">{item.label}</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <div className="text-[11px] text-slate-600 mb-0.5">Before</div>
                  <div className="text-xl font-bold text-slate-400 tabular-nums line-through decoration-rose-500/50">{item.before}</div>
                </div>
                <div className="mb-1 text-slate-700">→</div>
                <div>
                  <div className="text-[11px] text-slate-600 mb-0.5">After</div>
                  <div className="text-xl font-bold text-emerald-400 tabular-nums">{item.after}</div>
                </div>
                <div className="ml-auto mb-1">
                  <span className="text-[13px] font-bold text-emerald-400">-{pct}%</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-[#111827] border border-slate-800/60 rounded-xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-slate-800/60">
          <h3 className="text-[14px] font-semibold text-white">Target Queue Manager Architecture</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Simplified from 47 to 28 queue managers</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/60">
              {['Queue Manager', 'Role', 'Queues', 'Channels', 'Apps', 'Transformation'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {targetQMs.map((qm, i) => (
              <motion.tr
                key={qm.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 + 0.3 }}
                className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors"
              >
                <td className="px-5 py-3.5 font-mono text-[12px] text-emerald-400">{qm.id}</td>
                <td className="px-5 py-3.5 text-[12px] text-slate-400">{qm.role}</td>
                <td className="px-5 py-3.5 text-[13px] font-semibold text-white">{qm.queues}</td>
                <td className="px-5 py-3.5 text-[13px] font-semibold text-white">{qm.channels}</td>
                <td className="px-5 py-3.5 text-[13px] text-slate-300">{qm.apps}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[11px] text-emerald-400/80 font-mono">{qm.reduction}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/5 via-[#111827] to-[#111827] border border-emerald-500/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-[14px] font-semibold text-white">Target-State Validation Summary</h3>
          <StatusBadge label="All checks passed" variant="success" dot />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            'Zero policy violations in target',
            'All applications retain connectivity',
            'No message path disruptions',
            'Automation artifacts generated',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-[12px] text-slate-400">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
