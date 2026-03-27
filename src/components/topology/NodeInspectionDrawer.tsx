import { motion, AnimatePresence } from 'framer-motion'
import { X, AppWindow, Server, Layers, ArrowRightLeft, Send, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import type { Node } from '@xyflow/react'
import type { AppNodeData, QMNodeData, QueueNodeData } from '../../data/topologyData'
import StatusBadge from '../ui/StatusBadge'

interface NodeInspectionDrawerProps {
  node: Node<Record<string, unknown>> | null
  onClose: () => void
  connectedNodeIds: string[]
}

const riskVariant = {
  high: 'critical' as const,
  medium: 'warning' as const,
  low: 'success' as const,
  none: 'success' as const,
}

const riskLabel = {
  high: 'High Risk',
  medium: 'Medium Risk',
  low: 'Low Risk',
  none: 'Healthy',
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-800/50 last:border-0">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-[11px] font-mono text-slate-300 text-right max-w-[55%]">{value}</span>
    </div>
  )
}

export default function NodeInspectionDrawer({ node, onClose, connectedNodeIds }: NodeInspectionDrawerProps) {
  if (!node) return null

  const isApp = node.type === 'app'
  const isQM = node.type === 'queueManager'
  const isQueue = node.type === 'queue'

  const data = node.data
  const appData = isApp ? (data as AppNodeData) : null
  const qmData = isQM ? (data as QMNodeData) : null
  const queueData = isQueue ? (data as QueueNodeData) : null

  const risk = data.risk as string
  const issues = (data.issues as string[]) || []

  const typeLabel = isApp ? 'Application' : isQM ? 'Queue Manager' : 'Queue'
  const TypeIcon = isApp ? AppWindow : isQM ? Server : (queueData?.subtype === 'remote' ? ArrowRightLeft : queueData?.subtype === 'xmitq' ? Send : Layers)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute top-0 right-0 h-full w-80 bg-[#0F172A] border-l border-slate-800/80 z-20 flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
              ${isApp ? 'bg-blue-500/10 border border-blue-500/20' : isQM ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-teal-500/10 border border-teal-500/20'}`}>
              <TypeIcon className={`w-4 h-4 ${isApp ? 'text-blue-400' : isQM ? 'text-cyan-400' : 'text-teal-400'}`} />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">Node Inspector</div>
              <div className="text-[10px] text-slate-500">{typeLabel}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-[14px] font-mono font-bold text-white leading-tight">{data.label as string}</h3>
              <StatusBadge label={riskLabel[risk as keyof typeof riskLabel] || 'Unknown'} variant={riskVariant[risk as keyof typeof riskVariant] || 'neutral'} dot />
            </div>
            {data.description ? (
              <p className="text-[12px] text-slate-500 leading-relaxed mt-1.5">{String(data.description)}</p>
            ) : null}
          </div>

          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Metadata</div>
            {appData && (
              <>
                <MetaRow label="Role" value={appData.role} />
                <MetaRow label="Connections" value={`${appData.connections} total`} />
                <MetaRow label="Region" value={appData.region} />
                <MetaRow label="Risk Level" value={riskLabel[appData.risk]} />
              </>
            )}
            {qmData && (
              <>
                <MetaRow label="Region" value={qmData.region} />
                <MetaRow label="Queues" value={`${qmData.queues} total`} />
                <MetaRow label="Channels" value={`${qmData.channels} active`} />
                <MetaRow label="Connected Apps" value={`${qmData.apps} applications`} />
                <MetaRow label="Risk Level" value={riskLabel[qmData.risk]} />
              </>
            )}
            {queueData && (
              <>
                <MetaRow label="Type" value={queueData.subtype.toUpperCase()} />
                <MetaRow label="Owner QM" value={queueData.owner} />
                {queueData.depth !== undefined && <MetaRow label="Current Depth" value={queueData.depth.toLocaleString()} />}
                {queueData.maxDepth && <MetaRow label="Max Depth" value={queueData.maxDepth.toLocaleString()} />}
                <MetaRow label="Risk Level" value={riskLabel[queueData.risk]} />
              </>
            )}
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Connected Objects ({connectedNodeIds.length})
            </div>
            {connectedNodeIds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {connectedNodeIds.map((id) => (
                  <span key={id} className="text-[9px] font-mono px-2 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-400">
                    {id}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-600 italic">No direct connections</p>
            )}
          </div>

          {issues.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <div className="text-[10px] font-semibold text-rose-400/80 uppercase tracking-wider">Observed Issues</div>
              </div>
              <div className="space-y-1.5">
                {issues.map((issue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-400 leading-snug">{issue}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {issues.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[12px] text-emerald-300">No issues detected on this node</span>
            </div>
          )}

          <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5 text-violet-400" />
              <div className="text-[10px] font-semibold text-violet-400/80 uppercase tracking-wider">Why This Matters</div>
            </div>
            {risk === 'high' && (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This node is classified as high risk and is a priority target for simplification. Transformation of this node will have the highest complexity reduction impact.
              </p>
            )}
            {risk === 'medium' && (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Medium-risk node with actionable improvement opportunities. Addressing identified issues will reduce operational risk and improve topology health score.
              </p>
            )}
            {(risk === 'low' || risk === 'none') && (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This node is in a healthy state. No immediate action required. It may serve as a model pattern for other nodes in the estate.
              </p>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-800/60">
          <button className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[12px] font-semibold rounded-lg transition-all">
            Add to Transformation Plan
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
