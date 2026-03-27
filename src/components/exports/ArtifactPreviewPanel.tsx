import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Copy, Download, ExternalLink, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { artifacts, previewContent } from '../../data/exportsData'

interface ArtifactPreviewPanelProps {
  selectedId: string | null
  onClose: () => void
}

const checklistItems: Record<string, { label: string; passed: boolean; note?: string }[]> = {
  'ART-005': [
    { label: 'GP-114 Compliance: APP_BILLING isolation', passed: true, note: 'Dedicated QM_BILLING provisioned' },
    { label: 'GP-114 Compliance: APP_PAYMENTS isolation', passed: true, note: 'Dedicated QM_PAYMENTS provisioned' },
    { label: 'PP-007: Dead-letter queue on HUB-QM-01', passed: true, note: 'DLQ.HUB added' },
    { label: 'PP-007: Dead-letter queue on INT-QM-02', passed: true, note: 'DLQ.INT added' },
    { label: 'PP-007: Dead-letter queue on APP-QM-02', passed: true, note: 'DLQ.APP02 added' },
    { label: 'PCI-DSS: Payment network segmentation', passed: true, note: 'QM_PAYMENTS isolated on dedicated network segment' },
    { label: 'Naming convention enforcement', passed: true, note: '421 objects follow DOMAIN.APP.DIRECTION schema' },
    { label: 'Orphan object removal', passed: true, note: '6 orphan queues and 3 dead channels removed' },
    { label: 'Circular routing loop elimination', passed: true, note: 'INT-QM-02 → APP-QM-01 loop severed' },
    { label: 'Channel saturation remediation', passed: true, note: 'HUB-QM-01 channel burden reduced from 91% to 42%' },
    { label: 'XMIT_LEGACY decommission approval', passed: true, note: 'Zero-traffic confirmed, orphan validated' },
    { label: 'APP-QM-02 degraded status resolved', passed: true, note: 'Channel limit headroom restored' },
    { label: 'Remote queue canonical alias coverage', passed: true, note: '11 aliases consolidated to 6 canonical definitions' },
    { label: 'Transformation evidence audit trail', passed: true, note: '24 decisions logged with full rationale' },
    { label: 'Max channel limit buffer (>25%)', passed: true, note: 'All QMs operating below 75% channel capacity' },
    { label: 'Health monitoring on all QMs', passed: false, note: 'Pending: 2 QMs missing monitoring configuration' },
    { label: 'SSL cipher enforcement', passed: true, note: 'TLS_RSA_WITH_AES_256 enforced on all SVRCONN channels' },
    { label: 'DLQ monitoring alerts configured', passed: false, note: 'Pending: alerting integration not yet configured' },
  ],
  'ART-008': [
    { label: 'Architect review: APP_BILLING assignment', passed: true, note: 'Approved — Sarah Chen, 2024-03-12' },
    { label: 'Architect review: XMIT_LEGACY removal', passed: true, note: 'Approved — James Okafor, 2024-03-12' },
    { label: 'Architect review: Routing loop severance', passed: true, note: 'Approved — Priya Sharma, 2024-03-12' },
    { label: 'Architect review: APP_PAYMENTS PCI alignment', passed: false, note: 'Pending — awaiting compliance team sign-off' },
    { label: 'Architect review: Remote queue consolidation', passed: false, note: 'Under review — Marcus Webb' },
    { label: 'Architect review: APP-QM-02 remediation', passed: false, note: 'Flagged — coordination required' },
    { label: 'Architect review: DLQ provisioning', passed: true, note: 'Approved — Sarah Chen, 2024-03-13' },
  ],
}

const executiveSummary = `EXECUTIVE SUMMARY
MQ Topology Transformation — Target-State Architecture
Generated: 2024-03-15 | Classification: Internal

TRANSFORMATION OUTCOMES
─────────────────────────────────────────────
  Topology Complexity      78 → 33    (−58%)
  Queue Managers           9  → 7     (−22%)
  Active Channels          22 → 9     (−59%)
  Policy Violations        18 → 0     (−100%)
  Risk Score               84 → 31    (−63%)
  Architecture Confidence  ——   94%

KEY BUSINESS VALUE DELIVERED
─────────────────────────────────────────────
  • Compliance posture: GP-114 and PCI-DSS alignment
    achieved for APP_BILLING and APP_PAYMENTS workloads

  • Operational clarity: Deterministic routing paths
    reduce support incident resolution time

  • Governance readiness: All 421 topology objects now
    follow canonical naming schema — automation-ready

  • Failure blast radius: From 7 apps on shared QM to
    maximum 2 apps per failure domain

  • Onboarding velocity: New app onboarding no longer
    requires hub topology redesign

VALIDATION STATUS
─────────────────────────────────────────────
  Architecture rules validated:    18/18 resolved
  Decision traceability coverage:  24/24 decisions
  Provisioning manifest generated: YAML v1.2 schema
  Export artifacts:                7 of 8 complete

  Status: READY FOR PROVISIONING HANDOFF`

function LineNumbers({ count }: { count: number }) {
  return (
    <div className="pr-3 text-right select-none border-r border-slate-800/50 mr-3 flex-shrink-0" style={{ minWidth: 28 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="text-[10px] text-slate-700 leading-5">{i + 1}</div>
      ))}
    </div>
  )
}

export default function ArtifactPreviewPanel({ selectedId, onClose }: ArtifactPreviewPanelProps) {
  const artifact = artifacts.find(a => a.id === selectedId)

  return (
    <div className="bg-[#0D1117] border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/50 bg-[#0F1520]/60">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-[13px] font-semibold text-slate-200">
            {artifact ? artifact.name : 'Preview Workspace'}
          </span>
          {artifact && (
            <div className="flex gap-1">
              {artifact.formats.map(f => (
                <span key={f} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40 text-slate-600">{f}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {artifact && (
            <>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/30 text-slate-600 hover:text-slate-300 transition-all">
                <Copy className="w-3 h-3" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/30 text-slate-600 hover:text-slate-300 transition-all">
                <Download className="w-3 h-3" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/30 text-slate-600 hover:text-slate-300 transition-all">
                <ExternalLink className="w-3 h-3" />
              </button>
            </>
          )}
          {selectedId && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/30 text-slate-600 hover:text-rose-400 transition-all">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {!artifact ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center px-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-slate-700" />
              </div>
              <p className="text-[13px] text-slate-600 font-medium">Select an artifact to preview</p>
              <p className="text-[11px] text-slate-700 mt-1">Click any artifact from the library to inspect its content</p>
            </motion.div>
          ) : artifact.previewType === 'csv' || artifact.previewType === 'json' || artifact.previewType === 'yaml' ? (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-700 uppercase tracking-wider font-semibold">Content Preview</span>
                {artifact.lines && (
                  <span className="text-[10px] font-mono text-slate-700">{artifact.lines.toLocaleString()} lines total — showing first 18</span>
                )}
              </div>
              <div className="bg-[#0A0E17] border border-slate-800/60 rounded-xl overflow-hidden font-mono">
                <div className="flex text-[11px] leading-5 overflow-x-auto p-3">
                  <LineNumbers count={previewContent[artifact.id]?.split('\n').length || 1} />
                  <pre className="text-slate-400 whitespace-pre flex-1">{previewContent[artifact.id]}</pre>
                </div>
              </div>
              {artifact.generated && (
                <div className="mt-2 text-[10px] text-slate-700 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-600" />
                  Generated {artifact.generated} · {artifact.size}
                </div>
              )}
            </motion.div>
          ) : artifact.previewType === 'checklist' ? (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 space-y-2"
            >
              <div className="text-[10px] text-slate-700 uppercase tracking-wider font-semibold mb-3">Compliance Checklist</div>
              {(checklistItems[artifact.id] || []).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${item.passed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-amber-500/5 border-amber-500/15'}`}
                >
                  {item.passed
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={`text-[11px] font-medium ${item.passed ? 'text-slate-300' : 'text-amber-300'}`}>{item.label}</p>
                    {item.note && <p className="text-[10px] text-slate-600 mt-0.5">{item.note}</p>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : artifact.previewType === 'executive' ? (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
            >
              <div className="bg-[#0A0E17] border border-slate-800/60 rounded-xl overflow-hidden font-mono">
                <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-700 uppercase tracking-wider">Document Preview</span>
                  <span className="text-[10px] font-mono text-slate-700">{artifact.size}</span>
                </div>
                <pre className="text-[11px] text-slate-400 leading-6 p-4 whitespace-pre">{executiveSummary}</pre>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
            >
              <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4">
                <p className="text-[12px] text-slate-400 leading-relaxed">{artifact.description}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  This artifact requires review before export. Check status above.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
