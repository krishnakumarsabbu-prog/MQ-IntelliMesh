import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { transformationTimeline } from '../../data/targetStateData'

type TimelineStep = typeof transformationTimeline[number]

interface TransformationTimelineProps {
  steps: TimelineStep[]
}

export default function TransformationTimeline({ steps }: TransformationTimelineProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl px-5 py-4">
      <h3 className="text-[13px] font-semibold text-white mb-4">Transformation Pipeline</h3>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={step.step} className="flex items-center gap-1 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="flex flex-col items-center gap-1.5 min-w-[88px] text-center"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#111827]" />
              </div>
              <div className="text-[10px] font-semibold text-slate-300 leading-tight text-center">{step.label}</div>
              <div className="text-[9px] text-slate-600 font-mono text-center">{step.detail}</div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.4, duration: 0.4 }}
                className="w-6 h-0.5 bg-gradient-to-r from-emerald-500/50 to-emerald-500/20 flex-shrink-0 origin-left"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
