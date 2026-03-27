import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { readinessDimensions } from '../../data/exportsData'

function ReadinessRing({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 95 ? '#10B981' : score >= 80 ? '#3B82F6' : '#F59E0B'

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#1E293B" strokeWidth="6" />
        <motion.circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center">
        <motion.div
          className="text-[22px] font-black tabular-nums"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.div>
        <div className="text-[9px] text-slate-600 leading-tight mt-0.5">Ready</div>
      </div>
    </div>
  )
}

export default function ReadinessPanel() {
  const overallScore = 93

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Automation Readiness</h2>
          <p className="text-[11px] text-slate-500">Multi-dimensional readiness assessment for downstream provisioning</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-6 mb-6">
          <ReadinessRing score={overallScore} />
          <div>
            <div className="text-[20px] font-black text-white leading-tight">{overallScore}% Ready</div>
            <div className="text-[12px] text-slate-400 mt-1 leading-relaxed max-w-xs">
              Target-state topology is validated and provisioning-compatible. 2 minor dimensions require final action.
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold">Ready for handoff to provisioning pipeline</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {readinessDimensions.map((dim, i) => {
            const color = dim.score >= 99 ? { bar: 'bg-emerald-500', text: 'text-emerald-400' }
              : dim.score >= 90 ? { bar: 'bg-blue-500', text: 'text-blue-400' }
              : { bar: 'bg-amber-500', text: 'text-amber-400' }

            return (
              <div key={dim.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-medium">{dim.label}</span>
                  <span className={`text-[11px] font-bold font-mono tabular-nums ${color.text}`}>{dim.score}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${color.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ duration: 0.8, delay: i * 0.07 + 0.3, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-slate-700 mt-0.5">{dim.note}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
