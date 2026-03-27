import { motion } from 'framer-motion'
import { BrainCircuit, CheckCircle2, Tag, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ChatMessage } from '../../data/explainabilityData'

interface AIResponseCardProps {
  message: ChatMessage
  delay?: number
}

export default function AIResponseCard({ message, delay = 0 }: AIResponseCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
          <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold text-violet-400">MQ IntelliMesh Copilot</span>
          <span className="text-[10px] text-slate-700">{message.timestamp}</span>
          {message.confidence !== undefined && (
            <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-2 py-0.5 rounded-full">
              {message.confidence}% confident
            </span>
          )}
        </div>

        <div className="bg-[#161D2C] border border-slate-700/40 rounded-xl rounded-tl-none overflow-hidden">
          <div className="p-4">
            <p className="text-[13px] text-slate-200 leading-relaxed">{message.text}</p>

            {message.bullets && message.bullets.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.bullets.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + i * 0.08 + 0.2 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 flex-shrink-0 mt-1.5" />
                    <span className="text-[12px] text-slate-300 leading-relaxed">{b}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {(message.impact || message.affectedObjects || message.tags) && (
            <>
              <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-800/30 border-t border-slate-700/30 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                <span className="uppercase tracking-wider font-semibold">Analysis Details</span>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-4 py-3 bg-slate-900/30 border-t border-slate-800/20 space-y-3"
                >
                  {message.impact && (
                    <div>
                      <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1.5 font-semibold">Impact Assessment</div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-emerald-300 leading-relaxed">{message.impact}</p>
                      </div>
                    </div>
                  )}
                  {message.affectedObjects && (
                    <div>
                      <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1.5 font-semibold">Affected Objects</div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.affectedObjects.map(obj => (
                          <span key={obj} className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-400">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {message.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {message.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/8 border border-violet-500/15 text-violet-400">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
