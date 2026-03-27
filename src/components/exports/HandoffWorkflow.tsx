import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, GitBranch, ArrowRight } from 'lucide-react'
import { workflowSteps } from '../../data/exportsData'

export default function HandoffWorkflow() {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Operational Handoff Workflow</h2>
          <p className="text-[11px] text-slate-500">Enterprise transformation pipeline — analysis through provisioning release</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => (
            <div key={step.id} className="flex items-start gap-2 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.1 }}
                className={`relative flex flex-col items-center gap-2 w-36 rounded-xl border p-3.5 text-center transition-all ${
                  step.status === 'complete'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : step.status === 'active'
                    ? 'bg-blue-500/8 border-blue-500/30 ring-1 ring-blue-500/15'
                    : 'bg-slate-900/30 border-slate-800/40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.status === 'complete'
                    ? 'bg-emerald-500/15 border-emerald-500/40'
                    : step.status === 'active'
                    ? 'bg-blue-500/15 border-blue-500/40'
                    : 'bg-slate-800/60 border-slate-700/40'
                }`}>
                  {step.status === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : step.status === 'active' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-700" />
                  )}
                </div>

                <div>
                  <div className={`text-[11px] font-semibold leading-tight ${
                    step.status === 'complete' ? 'text-emerald-300'
                    : step.status === 'active' ? 'text-blue-200'
                    : 'text-slate-600'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-[10px] mt-0.5 leading-tight ${
                    step.status === 'complete' ? 'text-emerald-600'
                    : step.status === 'active' ? 'text-blue-500'
                    : 'text-slate-700'
                  }`}>
                    {step.sublabel}
                  </div>
                </div>

                <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  step.status === 'complete'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
                    : step.status === 'active'
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/15'
                    : 'text-slate-700 bg-slate-800/30 border-slate-700/20'
                }`}>
                  {step.status === 'complete' ? 'Complete' : step.status === 'active' ? 'In Progress' : 'Pending'}
                </div>

                {step.status === 'active' && (
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-400 border border-[#111827] animate-pulse" />
                )}
              </motion.div>

              {i < workflowSteps.length - 1 && (
                <div className="flex items-center mt-7 flex-shrink-0">
                  <ArrowRight className={`w-4 h-4 ${i < 3 ? 'text-emerald-600' : 'text-slate-700'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 font-medium">Step 4 of 6 — Delivery artifacts being finalised</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[11px] text-slate-600 font-mono">60%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
