import type { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  action?: React.ReactNode
}

export default function SectionHeader({ title, subtitle, icon: Icon, iconColor = 'text-blue-400', action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`${iconColor}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        <div>
          <h2 className="text-[15px] font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
