import { motion } from 'framer-motion'
import { BrainCircuit, CheckCircle2, Users, Database, Sparkles } from 'lucide-react'

const statusBadges = [
  { label: 'AI Copilot Active', color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/25', dot: 'bg-violet-400' },
  { label: 'Reasoning Available', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  { label: 'Human Review Enabled', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  { label: 'Transformation Context Loaded', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
]

const supportStats = [
  { label: 'Decisions Explained', value: '24', icon: BrainCircuit, color: 'text-violet-400' },
  { label: 'Architecture Confidence', value: '94%', icon: Sparkles, color: 'text-blue-400' },
  { label: 'Scenarios Evaluated', value: '12', icon: Database, color: 'text-cyan-400' },
  { label: 'Validation-Ready', value: '18', icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Pending Review', value: '3', icon: Users, color: 'text-amber-400' },
]

export default function CopilotHero() {
  return (
    <div className="relative bg-[#0D1117] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/25 via-transparent to-blue-950/20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="relative px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-violet-400" />
              </div>
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-violet-400 border-2 border-[#0D1117]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              />
            </div>
            <div>
              <h1 className="text-[20px] font-black text-white tracking-tight">AI Transformation Copilot</h1>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed max-w-xl">
                Ask why decisions were made, review transformation logic, and simulate how topology changes affect complexity, compliance, and operational risk.
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
                <div className={`w-1.5 h-1.5 rounded-full ${b.dot} animate-pulse`} />
                {b.label}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                  <div className={`text-[16px] font-black tabular-nums leading-none ${stat.color}`}>{stat.value}</div>
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
