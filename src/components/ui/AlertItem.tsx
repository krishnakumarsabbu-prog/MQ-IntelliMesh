import type { LucideIcon } from 'lucide-react'

interface AlertItemProps {
  message: string
  count?: number
  severity: 'critical' | 'warning' | 'info' | 'success'
  icon?: LucideIcon
  timestamp?: string
}

const severityStyles = {
  critical: { dot: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/10', badge: 'bg-rose-500/10 text-rose-400' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10', badge: 'bg-amber-500/10 text-amber-400' },
  info: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/10', badge: 'bg-blue-500/10 text-blue-400' },
  success: { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10', badge: 'bg-emerald-500/10 text-emerald-400' },
}

export default function AlertItem({ message, count, severity, icon: Icon, timestamp }: AlertItemProps) {
  const styles = severityStyles[severity]
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${styles.bg} transition-all hover:brightness-110`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${styles.dot} flex-shrink-0`} />
        {Icon && <Icon className={`w-4 h-4 ${styles.text} flex-shrink-0`} />}
        <span className="text-[13px] text-slate-300">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== undefined && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${styles.badge}`}>{count}</span>
        )}
        {timestamp && <span className="text-[11px] text-slate-600 font-mono">{timestamp}</span>}
      </div>
    </div>
  )
}
