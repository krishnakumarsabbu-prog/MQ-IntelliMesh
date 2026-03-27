import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface ReadinessItem {
  label: string
  done: boolean
}

interface ProgressCardProps {
  title: string
  score: number
  scoreLabel?: string
  description?: string
  items: ReadinessItem[]
  accentColor?: 'blue' | 'emerald' | 'amber' | 'cyan'
}

const accentMap = {
  blue: { bar: 'from-blue-500 to-cyan-500', text: 'text-blue-400', ring: 'stroke-blue-500' },
  emerald: { bar: 'from-emerald-500 to-cyan-400', text: 'text-emerald-400', ring: 'stroke-emerald-500' },
  amber: { bar: 'from-amber-500 to-orange-400', text: 'text-amber-400', ring: 'stroke-amber-500' },
  cyan: { bar: 'from-cyan-500 to-blue-400', text: 'text-cyan-400', ring: 'stroke-cyan-500' },
}

export default function ProgressCard({ title, score, scoreLabel, description, items, accentColor = 'blue' }: ProgressCardProps) {
  const accent = accentMap[accentColor]
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-xl p-5 h-full">
      <h3 className="text-[14px] font-semibold text-white mb-4">{title}</h3>
      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="#1E293B" strokeWidth="6" />
            <motion.circle
              cx="42"
              cy="42"
              r="36"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={accent.ring}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${accent.text}`}>{score}</span>
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">score</span>
          </div>
        </div>
        <div className="flex-1">
          {scoreLabel && <div className="text-[13px] font-semibold text-white mb-1">{scoreLabel}</div>}
          {description && <p className="text-[12px] text-slate-500 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {item.done
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            }
            <span className={`text-[12px] ${item.done ? 'text-slate-300' : 'text-slate-600'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
