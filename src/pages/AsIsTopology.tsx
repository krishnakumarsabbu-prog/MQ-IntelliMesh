import { motion } from 'framer-motion'
import { Network, Server, ArrowLeftRight, Layers, Filter, RefreshCw, ZoomIn } from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import StatusBadge from '../components/ui/StatusBadge'

const queueManagers = [
  { id: 'HUB-QM-01', type: 'Hub', queues: 68, channels: 42, apps: 18, status: 'healthy', risk: 'high' },
  { id: 'HUB-QM-02', type: 'Hub', queues: 54, channels: 38, apps: 14, status: 'healthy', risk: 'high' },
  { id: 'APP-QM-01', type: 'Application', queues: 24, channels: 12, apps: 6, status: 'healthy', risk: 'medium' },
  { id: 'APP-QM-02', type: 'Application', queues: 18, channels: 9, apps: 4, status: 'degraded', risk: 'medium' },
  { id: 'SVC-QM-01', type: 'Service', queues: 12, channels: 6, apps: 3, status: 'healthy', risk: 'low' },
  { id: 'SVC-QM-02', type: 'Service', queues: 9, channels: 4, apps: 2, status: 'healthy', risk: 'low' },
  { id: 'SVC-QM-03', type: 'Service', queues: 15, channels: 7, apps: 4, status: 'healthy', risk: 'low' },
  { id: 'INT-QM-01', type: 'Integration', queues: 31, channels: 19, apps: 9, status: 'warning', risk: 'medium' },
]

export default function AsIsTopology() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">As-Is Topology</h2>
          <p className="text-[13px] text-slate-500 mt-1">Current IBM MQ estate — 847 objects discovered across 47 queue managers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-400 text-sm rounded-lg transition-all">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-400 text-sm rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-scan</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Visualize</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Queue Managers', value: 47, icon: Server, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Queues', value: '1,247', icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Active Channels', value: 312, icon: ArrowLeftRight, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Connected Apps', value: 134, icon: Network, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#111827] border border-slate-800/60 rounded-xl p-4 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white tabular-nums">{stat.value}</div>
                <div className="text-[12px] text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-[#111827] border border-slate-800/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-white">Queue Manager Inventory</h3>
          <span className="text-[11px] text-slate-500 font-mono">Showing 8 of 47</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Queue Manager ID', 'Type', 'Queues', 'Channels', 'Connected Apps', 'Status', 'Risk Level'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queueManagers.map((qm, i) => (
                <motion.tr
                  key={qm.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 + 0.2 }}
                  className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[12px] text-blue-400 group-hover:text-blue-300 transition-colors">{qm.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-slate-400">{qm.type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-white tabular-nums">{qm.queues}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-white tabular-nums">{qm.channels}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] text-slate-300 tabular-nums">{qm.apps}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      label={qm.status}
                      variant={qm.status === 'healthy' ? 'success' : qm.status === 'degraded' ? 'critical' : 'warning'}
                      dot
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      label={qm.risk}
                      variant={qm.risk === 'high' ? 'critical' : qm.risk === 'medium' ? 'warning' : 'success'}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}
