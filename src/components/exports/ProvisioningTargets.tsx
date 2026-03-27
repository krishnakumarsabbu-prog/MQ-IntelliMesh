import { motion } from 'framer-motion'
import { Server, CheckCircle2, AlertCircle, Clock, FileCode2 } from 'lucide-react'
import { provisioningTargets } from '../../data/exportsData'

const compatibilityConfig = {
  full: {
    label: 'Full Compatibility',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  partial: {
    label: 'Partial',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertCircle,
  },
  planned: {
    label: 'Planned',
    color: 'text-slate-500',
    bg: 'bg-slate-700/20',
    border: 'border-slate-700/30',
    icon: Clock,
  },
}

const logoColors: Record<string, { bg: string; text: string }> = {
  OCP: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400' },
  K8S: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' },
  TF: { bg: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-400' },
  MQ: { bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400' },
  AWS: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
  AZ: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-300' },
}

export default function ProvisioningTargets() {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Server className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Provisioning Targets</h2>
          <p className="text-[11px] text-slate-500">Downstream deployment ecosystem compatibility and export contracts</p>
        </div>
        <div className="ml-auto flex items-center gap-4 text-[11px]">
          <span className="text-emerald-400 font-semibold">3 full</span>
          <span className="text-amber-400 font-semibold">2 partial</span>
          <span className="text-slate-600 font-semibold">1 planned</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {provisioningTargets.map((target, i) => {
          const compat = compatibilityConfig[target.compatibility]
          const CompatIcon = compat.icon
          const logo = logoColors[target.logo] || { bg: 'bg-slate-700/20 border-slate-700/30', text: 'text-slate-400' }

          return (
            <motion.div
              key={target.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className={`bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-700/60 transition-all ${
                target.compatibility === 'planned' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-[11px] ${logo.bg} ${logo.text}`}>
                    {target.logo}
                  </div>
                  <span className="text-[13px] font-semibold text-white">{target.name}</span>
                </div>
                <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${compat.bg} ${compat.border} ${compat.color}`}>
                  <CompatIcon className="w-2.5 h-2.5" />
                  {compat.label}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">{target.note}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                <div className={`flex items-center gap-1.5 text-[10px] font-medium ${target.exportContract ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <FileCode2 className="w-3 h-3" />
                  {target.exportContract ? 'Export contract available' : 'Contract not yet available'}
                </div>
                {target.exportContract && target.compatibility !== 'planned' && (
                  <button className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/60 border border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all">
                    View
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
