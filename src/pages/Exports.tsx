import { motion } from 'framer-motion'
import { Download, FileCode2, BookOpen, Terminal, Package, CheckCircle2, Clock } from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import StatusBadge from '../components/ui/StatusBadge'

const artifacts = [
  {
    id: 'EXP-001',
    name: 'Target State MQSC Scripts',
    description: 'Complete MQSC script bundle for creating target queue managers, queues, channels, and configuration.',
    format: 'MQSC',
    size: '142 KB',
    status: 'ready',
    icon: Terminal,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    id: 'EXP-002',
    name: 'Ansible Automation Playbook',
    description: 'Ansible playbook for automated MQ topology provisioning and migration across environments.',
    format: 'YAML',
    size: '89 KB',
    status: 'ready',
    icon: Package,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'EXP-003',
    name: 'Terraform Infrastructure Templates',
    description: 'Infrastructure-as-Code templates for MQ on cloud (AWS/Azure/GCP) using target-state architecture.',
    format: 'HCL',
    size: '234 KB',
    status: 'ready',
    icon: FileCode2,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    id: 'EXP-004',
    name: 'Explainability Report (PDF)',
    description: 'Executive-ready transformation report with AI rationale, before/after comparison, and complexity metrics.',
    format: 'PDF',
    size: '1.2 MB',
    status: 'ready',
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'EXP-005',
    name: 'Migration Sequencing Plan',
    description: 'Step-by-step ordered migration plan with rollback procedures, validation checkpoints, and dependencies.',
    format: 'JSON',
    size: '44 KB',
    status: 'generating',
    icon: FileCode2,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
]

export default function Exports() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Exports</h2>
          <p className="text-[13px] text-slate-500 mt-1">Automation-ready artifacts generated from the target-state transformation</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Artifacts Ready', value: '4 of 5', color: 'text-emerald-400' },
          { label: 'Total Export Size', value: '1.7 MB', color: 'text-blue-400' },
          { label: 'Last Generated', value: '15 Mar 2024', color: 'text-slate-300' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#111827] border border-slate-800/60 rounded-xl p-4 text-center"
          >
            <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-[12px] text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {artifacts.map((artifact, i) => {
          const Icon = artifact.icon
          return (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.2 }}
              className="bg-[#111827] border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/80 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${artifact.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${artifact.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <span className="font-mono text-[10px] text-slate-600">{artifact.id}</span>
                    <StatusBadge label={artifact.format} variant="neutral" />
                    {artifact.status === 'ready'
                      ? <StatusBadge label="Ready" variant="success" dot />
                      : <StatusBadge label="Generating..." variant="warning" dot pulse />
                    }
                  </div>
                  <h3 className="text-[14px] font-semibold text-white mb-1">{artifact.name}</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{artifact.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] font-mono text-slate-600">{artifact.size}</span>
                  {artifact.status === 'ready' ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-lg transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-slate-700/30 text-slate-500 text-sm rounded-lg">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Generating
                    </div>
                  )}
                </div>
              </div>
              {artifact.status === 'ready' && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400/70">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Validated against target-state architecture</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </PageContainer>
  )
}
