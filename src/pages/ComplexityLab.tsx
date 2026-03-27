import { motion } from 'framer-motion'
import { FlaskConical, TrendingDown, BarChart3, Activity } from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'

const metrics = [
  { label: 'Fan-out Index', current: 8.4, target: 3.2, max: 10, unit: '' },
  { label: 'Interconnectedness Score', current: 72, target: 38, max: 100, unit: '%' },
  { label: 'Hub Concentration', current: 64, target: 28, max: 100, unit: '%' },
  { label: 'Dead Letter Compliance', current: 41, target: 100, max: 100, unit: '%' },
  { label: 'Channel Utilization Rate', current: 77, target: 95, max: 100, unit: '%' },
  { label: 'Naming Convention Score', current: 58, target: 100, max: 100, unit: '%' },
]

const breakdown = [
  { category: 'Structural Complexity', score: 74, contributors: ['High fan-out at HUB-QM-01', 'Circular routing detected', 'Deep channel nesting'] },
  { category: 'Operational Risk', score: 61, contributors: ['Missing dead-letter queues', 'High CPU on INT-QM-01', 'Degraded APP-QM-02'] },
  { category: 'Governance Debt', score: 48, contributors: ['Naming inconsistencies', 'Policy violations: 18', 'Undocumented objects'] },
  { category: 'Scalability Risk', score: 55, contributors: ['Monolithic hub design', 'Single points of failure', 'App coupling to QM details'] },
]

export default function ComplexityLab() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Complexity Lab</h2>
        <p className="text-[13px] text-slate-500 mt-1">Deep metrics, scoring analysis, and complexity quantification</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Overall Complexity Score', value: '68 / 100', color: 'text-amber-400', hint: 'Target: ≤40', icon: BarChart3 },
          { label: 'Projected Reduction', value: '41%', color: 'text-emerald-400', hint: 'After transformation', icon: TrendingDown },
          { label: 'Analysis Dimensions', value: '4', color: 'text-blue-400', hint: 'Structural, operational, governance, scalability', icon: FlaskConical },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#111827] border border-slate-800/60 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-slate-500" />
                <span className="text-[11px] text-slate-600 font-mono">{stat.hint}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-1 tabular-nums`}>{stat.value}</div>
              <div className="text-[12px] text-slate-500">{stat.label}</div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <div className="bg-[#111827] border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-white mb-5">Key Complexity Metrics</h3>
          <div className="space-y-4">
            {metrics.map((m, i) => {
              const currentPct = (m.current / m.max) * 100
              const targetPct = (m.target / m.max) * 100
              const isHigherBetter = m.label.includes('Compliance') || m.label.includes('Utilization') || m.label.includes('Naming')
              const currentColor = isHigherBetter
                ? (currentPct >= 80 ? 'bg-emerald-500' : currentPct >= 50 ? 'bg-amber-500' : 'bg-rose-500')
                : (currentPct <= 40 ? 'bg-emerald-500' : currentPct <= 65 ? 'bg-amber-500' : 'bg-rose-500')
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 + 0.2 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-slate-400">{m.label}</span>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-400">{m.current}{m.unit}</span>
                      <span className="text-slate-700">→</span>
                      <span className="text-emerald-400">{m.target}{m.unit}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-slate-700/40" style={{ width: `${targetPct}%` }} />
                    <motion.div
                      className={`absolute inset-y-0 left-0 rounded-full ${currentColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${currentPct}%` }}
                      transition={{ duration: 1, delay: i * 0.06 + 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-white mb-5">Complexity Dimension Breakdown</h3>
          <div className="space-y-4">
            {breakdown.map((dim, i) => (
              <motion.div
                key={dim.category}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.2 }}
                className="p-3.5 rounded-lg bg-slate-800/30 border border-slate-700/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-white">{dim.category}</span>
                  <div className="flex items-center gap-1">
                    <Activity className={`w-3.5 h-3.5 ${dim.score >= 70 ? 'text-rose-400' : dim.score >= 50 ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span className={`text-[13px] font-bold tabular-nums ${dim.score >= 70 ? 'text-rose-400' : dim.score >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {dim.score}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {dim.contributors.map((c, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
                      <span className="text-[11px] text-slate-500">{c}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
