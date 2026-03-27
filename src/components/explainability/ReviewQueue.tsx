import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, CheckCircle2, Clock, AlertTriangle, ThumbsUp, ThumbsDown, Eye, Server, ArrowRightLeft, GitBranch, ShieldCheck, Route, AlertOctagon } from 'lucide-react'
import { reviewQueue } from '../../data/explainabilityData'
import type { ReviewItem } from '../../data/explainabilityData'

const statusConfig = {
  approved: {
    label: 'Approved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
    rowBorder: 'border-l-emerald-500/50',
  },
  'needs-review': {
    label: 'Needs Review',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
    rowBorder: 'border-l-amber-500/50',
  },
  flagged: {
    label: 'Flagged',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: AlertTriangle,
    rowBorder: 'border-l-rose-500/50',
  },
}

const categoryIcons: Record<string, React.ElementType> = {
  'App Assignment': Server,
  'Queue Standardization': ArrowRightLeft,
  'Channel Simplification': GitBranch,
  'Policy Enforcement': ShieldCheck,
  'Routing Optimization': Route,
  'Risk Mitigation': AlertOctagon,
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 95 ? '#10B981' : value >= 85 ? '#3B82F6' : '#F59E0B'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold" style={{ color }}>{value}%</span>
    </div>
  )
}

function ReviewItemCard({ item, index }: { item: ReviewItem; index: number }) {
  const [localStatus, setLocalStatus] = useState(item.status)
  const [showRationale, setShowRationale] = useState(false)
  const status = statusConfig[localStatus]
  const StatusIcon = status.icon
  const CatIcon = categoryIcons[item.category] || Server

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.1 }}
      className={`bg-slate-900/30 border border-slate-800/50 border-l-2 ${status.rowBorder} rounded-xl overflow-hidden`}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
              <CatIcon className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-[12px] font-semibold text-slate-200 leading-snug">{item.summary}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-800/50 border border-slate-700/30 px-1.5 py-0.5 rounded-md">{item.subject}</span>
                  <span className="text-[10px] text-slate-600">{item.category}</span>
                  <span className="text-[10px] text-slate-700">{item.timestamp}</span>
                </div>
              </div>
              <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${status.bg} ${status.border} ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <ConfidenceBar value={item.confidence} />
                <span className="text-[10px] text-slate-600">
                  {item.owner !== 'Unassigned'
                    ? <span className="text-slate-500">{item.owner}</span>
                    : <span className="text-amber-500/70">Unassigned</span>
                  }
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowRationale(v => !v)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600/40 transition-all"
                >
                  <Eye className="w-3 h-3" />
                  Rationale
                </button>
                {localStatus !== 'approved' && (
                  <button
                    onClick={() => setLocalStatus('approved')}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 transition-all"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Approve
                  </button>
                )}
                {localStatus !== 'flagged' && (
                  <button
                    onClick={() => setLocalStatus('flagged')}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 transition-all"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    Flag
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showRationale && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-slate-800/40"
            >
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0 mt-1.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.rationale}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function ReviewQueue() {
  const [filter, setFilter] = useState<'all' | 'approved' | 'needs-review' | 'flagged'>('all')

  const counts = {
    approved: reviewQueue.filter(r => r.status === 'approved').length,
    'needs-review': reviewQueue.filter(r => r.status === 'needs-review').length,
    flagged: reviewQueue.filter(r => r.status === 'flagged').length,
  }

  const filtered = filter === 'all' ? reviewQueue : reviewQueue.filter(r => r.status === filter)

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">Architect Review Queue</h2>
              <p className="text-[11px] text-slate-500">Human-in-the-loop validation and governance approval</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-[11px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              {counts.approved} Approved
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/8 border border-amber-500/15 text-amber-400 text-[11px] font-bold">
              <Clock className="w-3 h-3" />
              {counts['needs-review']} Pending
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/8 border border-rose-500/15 text-rose-400 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3" />
              {counts.flagged} Flagged
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4">
          {(['all', 'approved', 'needs-review', 'flagged'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-slate-700/60 border-slate-600/50 text-white'
                  : 'bg-slate-800/30 border-slate-700/30 text-slate-500 hover:text-slate-300'
              }`}
            >
              {f === 'needs-review' ? 'Needs Review' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span className="ml-1 text-[10px] opacity-60">({counts[f as keyof typeof counts]})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <AnimatePresence mode="wait">
          {filtered.map((item, i) => (
            <ReviewItemCard key={item.id} item={item} index={i} />
          ))}
        </AnimatePresence>
      </div>

      <div className="px-5 py-3 border-t border-slate-800/40 bg-slate-900/20 flex items-center gap-3 text-[10px] text-slate-700">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        All approved decisions are cryptographically logged in the transformation audit trail.
      </div>
    </div>
  )
}
