import { motion } from 'framer-motion'
import { PackageCheck, CheckCircle2, ShieldCheck, Boxes, Cpu, Download } from 'lucide-react'

const statusBadges = [
  { label: 'Export Ready', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  { label: 'Validation Passed', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  { label: 'Provisioning Pack Available', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  { label: 'Delivery Artifacts Generated', color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/25', dot: 'bg-violet-400' },
]

const supportStats = [
  { label: 'Artifacts Generated', value: '7/8', icon: Boxes, color: 'text-emerald-400' },
  { label: 'Automation Readiness', value: '93%', icon: Cpu, color: 'text-blue-400' },
  { label: 'Validation Coverage', value: '100%', icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Export Formats', value: '7', icon: PackageCheck, color: 'text-cyan-400' },
  { label: 'Decision Traceability', value: '24/24', icon: ShieldCheck, color: 'text-violet-400' },
  { label: 'Changeset Complete', value: '98%', icon: Download, color: 'text-teal-400' },
]

export default function DeliveryHero() {
  return (
    <div className="relative bg-[#0D1117] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-blue-950/20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />

      <div className="relative px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                <PackageCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0D1117]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
              />
            </div>
            <div>
              <h1 className="text-[20px] font-black text-white tracking-tight">Automation Delivery Center</h1>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed max-w-2xl">
                Export the validated target-state architecture as deployment-ready datasets, transformation evidence, governance reports, and provisioning-compatible automation inputs.
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
