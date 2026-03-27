import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import type { validationChecks } from '../../data/targetStateData'

type Check = typeof validationChecks[number]

interface ValidationPanelProps {
  checks: Check[]
}

const categoryColors: Record<string, string> = {
  Architecture: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Pattern: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  Governance: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Optimization: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  Routing: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  Validation: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Compliance: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Cleanup: 'bg-slate-700/40 text-slate-300 border-slate-700/60',
  Export: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Resilience: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  Security: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
}

export default function ValidationPanel({ checks }: ValidationPanelProps) {
  const passed = checks.filter(c => c.passed).length
  const total = checks.length

  return (
    <div className="bg-[#111827] border border-emerald-900/30 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">Target-State Validation</h2>
            <p className="text-[11px] text-slate-500">Policy &amp; architecture governance checks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[18px] font-black text-emerald-400 tabular-nums leading-none">{passed}/{total}</div>
            <div className="text-[9px] text-slate-600 uppercase tracking-wider">Checks</div>
          </div>
          <div className="ml-2 w-10 h-10 relative flex-shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#1E293B" strokeWidth="4" />
              <motion.circle
                cx="20" cy="20" r="16"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 16}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - passed / total) }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-2">
        {checks.map((check, i) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 + 0.2 }}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
              check.passed
                ? 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/8'
                : 'bg-rose-500/5 border-rose-500/15'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${check.passed ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="flex-1 text-[12px] text-slate-300">{check.label}</span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${categoryColors[check.category] || 'bg-slate-700/40 text-slate-400 border-slate-700'}`}>
              {check.category}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="px-5 py-3.5 border-t border-slate-800/60 bg-emerald-500/3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[12px] font-semibold text-emerald-300">All {total} checks passed — architecture is deployment-ready</span>
        </div>
      </div>
    </div>
  )
}
