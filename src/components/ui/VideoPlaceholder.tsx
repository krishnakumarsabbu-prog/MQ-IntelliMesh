import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Network, Zap, Target } from 'lucide-react'

export default function VideoPlaceholder() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="bg-[#111827] border border-slate-800/60 rounded-xl overflow-hidden">
        <div
          className="relative h-[200px] bg-gradient-to-br from-[#0B1020] via-[#0F172A] to-[#111827] overflow-hidden cursor-pointer group"
          onClick={() => setModalOpen(true)}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 border border-blue-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-blue-500/5 border border-blue-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-blue-500/5 border border-blue-500/10" />
            {[
              { x: '20%', y: '25%', icon: Network, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { x: '70%', y: '20%', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { x: '75%', y: '70%', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            ].map((node, i) => {
              const Icon = node.icon
              return (
                <motion.div
                  key={i}
                  className={`absolute w-9 h-9 rounded-xl ${node.bg} border flex items-center justify-center`}
                  style={{ left: node.x, top: node.y }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                >
                  <Icon className={`w-4 h-4 ${node.color}`} />
                </motion.div>
              )
            })}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.2 }}>
              <line x1="20%" y1="25%" x2="50%" y2="50%" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="70%" y1="20%" x2="50%" y2="50%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="75%" y1="70%" x2="50%" y2="50%" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-blue-500/20 border-2 border-blue-500/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-blue-500/30 group-hover:border-blue-400 transition-all shadow-lg shadow-blue-500/20"
            >
              <Play className="w-6 h-6 text-blue-300 ml-1" fill="currentColor" />
            </motion.button>
            <div className="text-center">
              <div className="text-[12px] font-semibold text-slate-300">Watch Overview</div>
              <div className="text-[11px] text-slate-600 mt-0.5">30 seconds</div>
            </div>
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm rounded-md px-2 py-1 border border-slate-700/50">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40">
          <h3 className="text-[13px] font-semibold text-white mb-1">How MQ IntelliMesh Works</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            A quick 30-second overview of topology discovery, simplification, and target-state generation.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-slate-700 rounded-2xl p-8 max-w-lg w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Product Demo Video</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                The full platform walkthrough video will be embedded here in the production release.
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="mt-6 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
