import { motion } from 'framer-motion'
import { CheckCircle2, Circle, PlayCircle, Clock, Zap } from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import StatusBadge from '../components/ui/StatusBadge'

const steps = [
  {
    id: 1,
    title: 'Topology Discovery',
    description: 'Ingest and parse MQ configuration exports. Identify all queue managers, queues, channels, and application bindings.',
    status: 'done',
    duration: '~2 min',
    objects: 847,
  },
  {
    id: 2,
    title: 'Dependency Mapping',
    description: 'Build directed dependency graph. Identify producers, consumers, and message flow patterns across all queue managers.',
    status: 'done',
    duration: '~3 min',
    objects: 312,
  },
  {
    id: 3,
    title: 'Anomaly Detection',
    description: 'Run structural, operational, and policy validation checks. Surface violations, cycles, and optimization candidates.',
    status: 'done',
    duration: '~1 min',
    objects: 44,
  },
  {
    id: 4,
    title: 'Simplification Engine',
    description: 'AI-driven topology simplification. Consolidate hubs, remove redundant channels, and standardize routing patterns.',
    status: 'active',
    duration: '~5 min',
    objects: null,
  },
  {
    id: 5,
    title: 'Target-State Generation',
    description: 'Produce optimized target architecture with reduction metrics, transformation rationale, and migration sequences.',
    status: 'pending',
    duration: '~2 min',
    objects: null,
  },
  {
    id: 6,
    title: 'Artifact Export',
    description: 'Generate automation-ready MQSC scripts, Ansible playbooks, Terraform templates, and explainability reports.',
    status: 'pending',
    duration: '~1 min',
    objects: null,
  },
]

export default function TransformationPlanner() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Transformation Planner</h2>
          <p className="text-[13px] text-slate-500 mt-1">Guided 6-step transformation workflow with AI-driven optimization</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          <Zap className="w-4 h-4" />
          Continue Transformation
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Steps Completed', value: '3 of 6', color: 'text-emerald-400' },
          { label: 'Objects Processed', value: '1,203', color: 'text-blue-400' },
          { label: 'Estimated Time Remaining', value: '~8 min', color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#111827] border border-slate-800/60 rounded-xl p-4 text-center"
          >
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-[12px] text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 + 0.2 }}
            className={`relative bg-[#111827] border rounded-xl p-5 transition-all ${
              step.status === 'active'
                ? 'border-blue-500/30 shadow-lg shadow-blue-500/10'
                : step.status === 'done'
                ? 'border-emerald-500/20'
                : 'border-slate-800/60 opacity-60'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'done' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : step.status === 'active' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <PlayCircle className="w-6 h-6 text-blue-400" />
                  </motion.div>
                ) : (
                  <Circle className="w-6 h-6 text-slate-700" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-[11px] font-mono text-slate-600">Step {step.id}</span>
                  <StatusBadge
                    label={step.status === 'done' ? 'Complete' : step.status === 'active' ? 'Running' : 'Pending'}
                    variant={step.status === 'done' ? 'success' : step.status === 'active' ? 'info' : 'neutral'}
                    dot={step.status === 'active'}
                    pulse={step.status === 'active'}
                  />
                  {step.objects && (
                    <span className="text-[11px] font-mono text-slate-600">{step.objects} objects</span>
                  )}
                </div>
                <h3 className="text-[14px] font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">{step.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span>{step.duration}</span>
              </div>
            </div>
            {step.status === 'active' && (
              <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  initial={{ width: '30%' }}
                  animate={{ width: '68%' }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </PageContainer>
  )
}
