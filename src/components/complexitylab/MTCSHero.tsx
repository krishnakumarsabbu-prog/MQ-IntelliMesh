import { motion } from 'framer-motion'
import { Brain, TrendingDown, Award, Zap } from 'lucide-react'
import type { mtcsScores } from '../../data/complexityData'

type MTCSScores = typeof mtcsScores

interface MTCSHeroProps {
  scores: MTCSScores
}

const gradeConfig = {
  Critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/25', ring: 'ring-rose-500/20' },
  High: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', ring: 'ring-amber-500/20' },
  Moderate: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', ring: 'ring-yellow-500/20' },
  Optimized: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', ring: 'ring-emerald-500/20' },
}

function ScoreDial({ value, grade, label, delay }: { value: number; grade: keyof typeof gradeConfig; label: string; delay: number }) {
  const cfg = gradeConfig[grade]
  const circumference = 2 * Math.PI * 54
  const offset = circumference * (1 - value / 100)
  const strokeColor = grade === 'Critical' ? '#F87171' : grade === 'Optimized' ? '#34D399' : '#FBBF24'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#1E293B" strokeWidth="8" />
          <motion.circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, delay: delay + 0.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[36px] font-black text-white leading-none tabular-nums">{value}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          {grade}
        </div>
        <div className="text-[12px] text-slate-400 mt-1.5 font-medium">{label}</div>
      </div>
    </motion.div>
  )
}

export default function MTCSHero({ scores }: MTCSHeroProps) {
  return (
    <div className="relative bg-[#0F172A] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-transparent to-cyan-950/20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="relative px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-white">MQ Topology Complexity Score</h1>
              <p className="text-[12px] text-slate-500">Multi-dimensional Topology Complexity Score (MTCS) — deterministic, reproducible, weighted</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-300 font-medium">8 Dimensions · Weighted Model</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-300 font-medium">Live Analysis</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-8 py-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex items-center gap-10 lg:gap-14">
            <ScoreDial value={scores.asIs} grade={scores.grade.asIs} label="As-Is State" delay={0.1} />

            <div className="flex flex-col items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-500/30 flex flex-col items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-emerald-400 mb-0.5" />
                  <span className="text-[22px] font-black text-emerald-400 leading-none tabular-nums">
                    {scores.reduction}%
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0F172A] flex items-center justify-center">
                  <Award className="w-2.5 h-2.5 text-emerald-900" />
                </div>
              </motion.div>
              <div className="text-center">
                <div className="text-[11px] font-bold text-emerald-300">NET REDUCTION</div>
                <div className="text-[10px] text-slate-600">complexity eliminated</div>
              </div>
            </div>

            <ScoreDial value={scores.target} grade={scores.grade.target} label="Target State" delay={0.3} />
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:max-w-md w-full">
            {[
              {
                label: 'Score Points Eliminated',
                value: `${scores.asIs - scores.target}`,
                unit: 'pts',
                color: 'text-blue-400',
                bg: 'bg-blue-500/8',
                border: 'border-blue-500/15',
                description: 'Absolute complexity reduction on 0–100 scale',
              },
              {
                label: 'Grade Improvement',
                value: `${scores.grade.asIs} → ${scores.grade.target}`,
                unit: '',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/8',
                border: 'border-emerald-500/15',
                description: 'Qualitative classification shift across tiers',
              },
              {
                label: 'Dimensions Improved',
                value: '8',
                unit: '/ 8',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/8',
                border: 'border-cyan-500/15',
                description: 'All scoring dimensions show positive movement',
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className={`${item.bg} border ${item.border} rounded-xl p-4`}
              >
                <div className={`text-[22px] font-black tabular-nums leading-none ${item.color} mb-0.5`}>
                  {item.value}
                  {item.unit && <span className="text-[13px] font-semibold text-slate-500 ml-1">{item.unit}</span>}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1.5 leading-tight">{item.label}</div>
                <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">{item.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-slate-800/50 bg-slate-900/30 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span className="text-[11px] text-slate-600">MTCS is deterministic — identical inputs always produce identical scores</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="h-3.5 w-px bg-slate-800" />
          {(['Critical', 'High', 'Moderate', 'Optimized'] as const).map(g => (
            <span key={g} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${gradeConfig[g].bg} ${gradeConfig[g].color} ${gradeConfig[g].border} border`}>
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
