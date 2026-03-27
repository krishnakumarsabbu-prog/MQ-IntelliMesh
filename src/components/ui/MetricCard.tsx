import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
  hint?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  delay?: number
}

export default function MetricCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  hint,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-500/10',
  delay = 0,
}: MetricCardProps) {
  const DeltaIcon = deltaType === 'up' ? TrendingUp : deltaType === 'down' ? TrendingDown : Minus
  const deltaColor = deltaType === 'up' ? 'text-emerald-400' : deltaType === 'down' ? 'text-rose-400' : 'text-slate-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="bg-[#111827] border border-slate-800/60 rounded-xl p-5 card-hover group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {delta && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${deltaColor}`}>
            <DeltaIcon className="w-3 h-3" />
            <span>{delta}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1 tabular-nums">{value}</div>
      <div className="text-[13px] font-medium text-slate-400 mb-1">{label}</div>
      {hint && <div className="text-[11px] text-slate-600 font-mono">{hint}</div>}
    </motion.div>
  )
}
