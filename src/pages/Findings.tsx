import { motion } from 'framer-motion'
import { AlertOctagon, AlertTriangle, Info, ArrowLeftRight, Unlink, Router, ShieldAlert, Clock } from 'lucide-react'
import PageContainer from '../components/ui/PageContainer'
import StatusBadge from '../components/ui/StatusBadge'

const findings = [
  {
    id: 'F-0021',
    title: 'Policy violation: Missing dead-letter queue on HUB-QM-01',
    category: 'Policy',
    severity: 'critical' as const,
    qm: 'HUB-QM-01',
    detected: '15 Mar 2024',
    impact: 'Messages may be silently discarded during backpressure events.',
  },
  {
    id: 'F-0022',
    title: '3 topology cycles detected in cluster routing paths',
    category: 'Topology',
    severity: 'critical' as const,
    qm: 'HUB-QM-01, HUB-QM-02',
    detected: '15 Mar 2024',
    impact: 'Circular routing increases latency and risks message storms.',
  },
  {
    id: 'F-0023',
    title: 'High fan-out hub with 18 application connections',
    category: 'Architecture',
    severity: 'critical' as const,
    qm: 'HUB-QM-01',
    detected: '14 Mar 2024',
    impact: 'Single point of failure. Any hub outage cascades to 18 apps.',
  },
  {
    id: 'F-0024',
    title: '7 redundant sender-receiver channel pairs identified',
    category: 'Optimization',
    severity: 'warning' as const,
    qm: 'Multiple',
    detected: '15 Mar 2024',
    impact: 'Redundant channels increase configuration surface area.',
  },
  {
    id: 'F-0025',
    title: '71 idle channels with no traffic in 30+ days',
    category: 'Cleanup',
    severity: 'warning' as const,
    qm: 'Multiple',
    detected: '15 Mar 2024',
    impact: 'Unused channels consume listener threads and obfuscate topology.',
  },
  {
    id: 'F-0026',
    title: '11 orphaned queues with no producers or consumers',
    category: 'Cleanup',
    severity: 'warning' as const,
    qm: 'APP-QM-02',
    detected: '13 Mar 2024',
    impact: 'Orphan objects increase scan time and administrative overhead.',
  },
  {
    id: 'F-0027',
    title: 'INT-QM-01 CPU utilization consistently above 80%',
    category: 'Performance',
    severity: 'warning' as const,
    qm: 'INT-QM-01',
    detected: '12 Mar 2024',
    impact: 'High CPU may degrade throughput under peak load conditions.',
  },
  {
    id: 'F-0028',
    title: '5 queue naming convention inconsistencies detected',
    category: 'Governance',
    severity: 'info' as const,
    qm: 'Multiple',
    detected: '10 Mar 2024',
    impact: 'Inconsistent naming complicates automation and onboarding.',
  },
]

const severityIconMap = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
}

const severityVariantMap = {
  critical: 'critical' as const,
  warning: 'warning' as const,
  info: 'info' as const,
}

export default function Findings() {
  const critical = findings.filter(f => f.severity === 'critical').length
  const warning = findings.filter(f => f.severity === 'warning').length
  const info = findings.filter(f => f.severity === 'info').length

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Findings</h2>
          <p className="text-[13px] text-slate-500 mt-1">Anomalies, risks, and policy violations from the latest topology scan</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={`${critical} Critical`} variant="critical" dot />
          <StatusBadge label={`${warning} Warning`} variant="warning" dot />
          <StatusBadge label={`${info} Info`} variant="info" dot />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Findings', value: findings.length, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Policy Violations', value: 18, icon: AlertOctagon, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Topology Anomalies', value: 5, icon: Router, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Cleanup Candidates', value: 82, icon: Unlink, color: 'text-blue-400', bg: 'bg-blue-500/10' },
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

      <div className="space-y-3">
        {findings.map((finding, i) => {
          const Icon = severityIconMap[finding.severity]
          return (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 + 0.2 }}
              className="bg-[#111827] border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/80 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  finding.severity === 'critical' ? 'bg-rose-500/10' : finding.severity === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                }`}>
                  <Icon className={`w-4.5 h-4.5 ${
                    finding.severity === 'critical' ? 'text-rose-400' : finding.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-mono text-[11px] text-slate-600">{finding.id}</span>
                    <StatusBadge label={finding.severity} variant={severityVariantMap[finding.severity]} />
                    <StatusBadge label={finding.category} variant="neutral" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white mb-1.5 group-hover:text-blue-300 transition-colors">{finding.title}</h3>
                  <p className="text-[12px] text-slate-500 mb-2">{finding.impact}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                    <span className="flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3" />
                      {finding.qm}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {finding.detected}
                    </span>
                  </div>
                </div>
                <button className="flex-shrink-0 px-3 py-1.5 text-[12px] font-medium text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100">
                  Investigate
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </PageContainer>
  )
}
