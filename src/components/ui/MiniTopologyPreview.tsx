import { motion } from 'framer-motion'
import { Server, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TopologyNode {
  id: string
  label: string
  x: number
  y: number
  type: 'source' | 'hub' | 'leaf' | 'target'
  queues?: number
}

const nodes: TopologyNode[] = [
  { id: 'app1', label: 'APP-QM-01', x: 8, y: 20, type: 'source', queues: 24 },
  { id: 'app2', label: 'APP-QM-02', x: 8, y: 55, type: 'source', queues: 18 },
  { id: 'hub1', label: 'HUB-QM-01', x: 40, y: 37, type: 'hub', queues: 68 },
  { id: 'leaf1', label: 'SVC-QM-01', x: 72, y: 18, type: 'leaf', queues: 12 },
  { id: 'leaf2', label: 'SVC-QM-02', x: 72, y: 38, type: 'leaf', queues: 9 },
  { id: 'leaf3', label: 'SVC-QM-03', x: 72, y: 58, type: 'leaf', queues: 15 },
]

const connections = [
  { from: 'app1', to: 'hub1' },
  { from: 'app2', to: 'hub1' },
  { from: 'hub1', to: 'leaf1' },
  { from: 'hub1', to: 'leaf2' },
  { from: 'hub1', to: 'leaf3' },
]

const nodeColors = {
  source: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-300', dot: 'bg-blue-400' },
  hub: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-300', dot: 'bg-amber-400' },
  leaf: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  target: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-300', dot: 'bg-cyan-400' },
}

export default function MiniTopologyPreview() {
  const navigate = useNavigate()
  const getNodeById = (id: string) => nodes.find(n => n.id === id)

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-white">Topology Preview</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Current as-is estate snapshot</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <Server className="w-3 h-3" />
          <span>6 QMs</span>
        </div>
      </div>

      <div className="relative bg-[#0B1020] rounded-lg border border-slate-800/40 overflow-hidden" style={{ height: 130 }}>
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
          {connections.map((conn, i) => {
            const fromNode = getNodeById(conn.from)
            const toNode = getNodeById(conn.to)
            if (!fromNode || !toNode) return null
            const x1 = `${fromNode.x + 6}%`
            const y1 = `${fromNode.y + 4}%`
            const x2 = `${toNode.x}%`
            const y2 = `${toNode.y + 4}%`
            return (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }}
              />
            )
          })}
        </svg>

        {nodes.map((node, i) => {
          const colors = nodeColors[node.type]
          return (
            <motion.div
              key={node.id}
              className={`absolute flex flex-col items-center cursor-pointer group`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 + 0.2, duration: 0.3 }}
            >
              <div className={`w-11 h-8 rounded-md ${colors.bg} border ${colors.border} flex flex-col items-center justify-center gap-0.5 group-hover:scale-110 transition-transform`}>
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                <span className={`text-[7px] font-mono ${colors.text} truncate max-w-[36px] leading-none`}>{node.label.split('-')[0]}</span>
              </div>
              {node.queues && (
                <span className="text-[8px] text-slate-600 font-mono mt-0.5">{node.queues}Q</span>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          {[
            { label: 'Source', color: 'bg-blue-400' },
            { label: 'Hub', color: 'bg-amber-400' },
            { label: 'Service', color: 'bg-emerald-400' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
              <span className="text-[10px] text-slate-600">{l.label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/topology')}
          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          <span>View Full</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
