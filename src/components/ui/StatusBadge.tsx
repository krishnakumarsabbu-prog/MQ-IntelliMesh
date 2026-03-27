interface StatusBadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'critical' | 'info' | 'ai' | 'neutral'
  dot?: boolean
  pulse?: boolean
  size?: 'sm' | 'md'
}

const variantStyles = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ai: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  neutral: 'bg-slate-700/40 text-slate-400 border-slate-700/60',
}

const dotStyles = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-rose-400',
  info: 'bg-blue-400',
  ai: 'bg-violet-400',
  neutral: 'bg-slate-400',
}

export default function StatusBadge({ label, variant = 'neutral', dot = false, pulse = false, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${variantStyles[variant]} ${sizeClass}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </span>
  )
}
