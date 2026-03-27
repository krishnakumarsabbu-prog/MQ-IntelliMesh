import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

interface AIInsight {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
}

interface AIInsightCardProps {
  insights: AIInsight[]
}

const impactStyles = {
  high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export default function AIInsightCard({ insights }: AIInsightCardProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-xl p-5 h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-white">AI Recommendations</h3>
          <p className="text-[11px] text-slate-500">System-generated insights</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}
            className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-violet-500/20 hover:bg-violet-500/5 transition-all cursor-pointer"
          >
            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-slate-200 leading-snug mb-1">{insight.title}</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">{insight.description}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-mono text-slate-600">{insight.category}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${impactStyles[insight.impact]}`}>
                  {insight.impact} impact
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-0.5" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
