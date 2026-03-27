export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  bullets?: string[]
  impact?: string
  confidence?: number
  affectedObjects?: string[]
  tags?: string[]
}

export interface DecisionRecord {
  id: string
  category: 'App Assignment' | 'Queue Standardization' | 'Channel Simplification' | 'Policy Enforcement' | 'Routing Optimization' | 'Risk Mitigation'
  subject: string
  change: string
  why: string
  complexityDelta: number
  riskDelta: number
  confidence: number
  affectedObjects: string[]
}

export interface ArchitectureInsight {
  id: string
  icon: string
  title: string
  technical: string
  operational: string
  businessValue: string
  impact: 'high' | 'medium' | 'low'
}

export interface SimulationScenario {
  id: string
  label: string
  description: string
  icon: string
  effects: {
    label: string
    delta: number
    unit: string
    direction: 'positive' | 'negative' | 'neutral'
  }[]
  recommendation: string
  risk: 'low' | 'medium' | 'high'
}

export interface ReviewItem {
  id: string
  summary: string
  category: string
  status: 'approved' | 'needs-review' | 'flagged'
  confidence: number
  owner: string
  subject: string
  rationale: string
  timestamp: string
}

export const suggestedPrompts = [
  'Why was APP_BILLING moved to QM_BILLING?',
  'Which queue managers are highest risk?',
  'How did we reduce routing complexity?',
  'What changed for APP_SETTLEMENT?',
  'Why was XMIT_LEGACY channel removed?',
  'Show all policy violations resolved.',
  'What happens if I add a new application?',
  'Explain the fan-out reduction strategy.',
]

export const chatHistory: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    text: 'Why was APP_BILLING moved to QM_BILLING?',
    timestamp: '09:14',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    text: 'APP_BILLING was reassigned from the shared HUB-QM-01 to a dedicated QM_BILLING instance. This decision was driven by three convergent signals detected in the topology analysis.',
    timestamp: '09:14',
    bullets: [
      'APP_BILLING accounted for 34% of HUB-QM-01\'s total message throughput — disproportionate for a shared hub.',
      'Billing workloads carry a compliance classification that requires dedicated queue manager isolation under governance policy GP-114.',
      'Channel XMIT_BILLING to INT-QM-02 was creating a 3-hop routing path. Dedicated placement reduces this to 1 hop.',
      'Risk surface at HUB-QM-01 is reduced by removing a high-value application from a multi-tenant environment.',
    ],
    impact: 'Routing depth reduced by 2 hops. Compliance posture improved. HUB-QM-01 load reduced by ~34%.',
    confidence: 97,
    affectedObjects: ['APP_BILLING', 'HUB-QM-01', 'QM_BILLING', 'XMIT_BILLING', 'Q.BILLING.IN', 'Q.BILLING.OUT'],
    tags: ['App Assignment', 'Compliance', 'Routing Optimization'],
  },
  {
    id: 'msg-3',
    role: 'user',
    text: 'Which queue managers are highest risk?',
    timestamp: '09:16',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    text: 'In the as-is topology, three queue managers carry elevated risk profiles. Here is the analysis ranked by composite risk score.',
    timestamp: '09:16',
    bullets: [
      'HUB-QM-01 — Risk Score 84/100. Hosts 7 applications simultaneously. Single point of failure. Missing dead-letter queue on 3 of 9 local queues. Channel saturation at 91%.',
      'INT-QM-02 — Risk Score 71/100. Intermediate routing hub with bidirectional XMIT channels to 4 targets. Circular routing path detected. No health monitoring configured.',
      'APP-QM-02 — Risk Score 58/100. Running a degraded status. Max channel limit approaching. Hosts APP_CLAIMS which has no failover designation.',
    ],
    impact: 'These three QMs contribute 67% of total topology risk. All three are addressed in the target-state transformation.',
    confidence: 92,
    affectedObjects: ['HUB-QM-01', 'INT-QM-02', 'APP-QM-02'],
    tags: ['Risk Analysis', 'Queue Manager'],
  },
  {
    id: 'msg-5',
    role: 'user',
    text: 'How did we reduce routing complexity?',
    timestamp: '09:19',
  },
  {
    id: 'msg-6',
    role: 'assistant',
    text: 'Routing complexity was reduced through three structural interventions that collectively eliminate the hub-and-spoke bottleneck and replace multi-hop chains with direct ownership patterns.',
    timestamp: '09:19',
    bullets: [
      'Hub decomposition: HUB-QM-01 is restructured from a 7-app shared hub into two dedicated QMs (QM_BILLING, QM_PAYMENTS), reducing average path length from 3.4 to 1.2 hops.',
      'XMIT chain consolidation: 4 of 7 transmission queue chains were redundant. Eliminated XMIT_LEGACY, XMIT_FALLBACK, XMIT_SHADOW. Retained 3 production channels.',
      'Remote queue standardisation: 11 remote queue definitions were collapsed into 6 canonical routing aliases, removing ambiguous multi-target resolution paths.',
      'Dead routing loop removal: A circular reference between INT-QM-02 → APP-QM-01 → INT-QM-02 via Q.FORWARD.OUT was detected and severed.',
    ],
    impact: 'Routing depth score reduced from 78 to 33 (−58%). Channel burden reduced from 22 channels to 9 (−59%).',
    confidence: 95,
    affectedObjects: ['HUB-QM-01', 'INT-QM-02', 'XMIT_LEGACY', 'XMIT_FALLBACK', 'XMIT_SHADOW', 'Q.FORWARD.OUT'],
    tags: ['Routing Optimization', 'Channel Simplification'],
  },
]

export const decisionRecords: DecisionRecord[] = [
  {
    id: 'dec-001',
    category: 'App Assignment',
    subject: 'APP_BILLING',
    change: 'Moved from HUB-QM-01 to dedicated QM_BILLING',
    why: 'Compliance isolation requirement GP-114. Throughput dominance on shared host. 3-hop routing path reduction.',
    complexityDelta: -18,
    riskDelta: -24,
    confidence: 97,
    affectedObjects: ['APP_BILLING', 'HUB-QM-01', 'QM_BILLING', 'Q.BILLING.IN', 'Q.BILLING.OUT'],
  },
  {
    id: 'dec-002',
    category: 'App Assignment',
    subject: 'APP_PAYMENTS',
    change: 'Moved from HUB-QM-01 to dedicated QM_PAYMENTS',
    why: 'High transaction volume app co-located on shared hub. PCI-DSS alignment requires network segmentation.',
    complexityDelta: -15,
    riskDelta: -22,
    confidence: 94,
    affectedObjects: ['APP_PAYMENTS', 'HUB-QM-01', 'QM_PAYMENTS', 'Q.PAY.IN', 'Q.PAY.OUT'],
  },
  {
    id: 'dec-003',
    category: 'Channel Simplification',
    subject: 'XMIT_LEGACY',
    change: 'Transmission channel removed',
    why: 'XMIT_LEGACY carried 0 messages in 90-day observation window. Target queue object Q.LEGACY.TARGET was marked orphan. No application dependency traced.',
    complexityDelta: -9,
    riskDelta: -6,
    confidence: 99,
    affectedObjects: ['XMIT_LEGACY', 'Q.LEGACY.TARGET', 'CHAN.LEGACY.OUT'],
  },
  {
    id: 'dec-004',
    category: 'Routing Optimization',
    subject: 'Q.FORWARD.OUT',
    change: 'Circular routing loop severed at INT-QM-02',
    why: 'Message inspection revealed a routing loop: INT-QM-02 → APP-QM-01 → INT-QM-02 via Q.FORWARD.OUT. This caused indefinite retry amplification under load.',
    complexityDelta: -12,
    riskDelta: -31,
    confidence: 96,
    affectedObjects: ['Q.FORWARD.OUT', 'INT-QM-02', 'APP-QM-01', 'CHAN.INTAPP.01'],
  },
  {
    id: 'dec-005',
    category: 'Queue Standardization',
    subject: 'Remote Queue Aliases',
    change: '11 remote queue definitions collapsed to 6 canonical aliases',
    why: 'Multiple applications resolved to overlapping remote queue targets with inconsistent naming. Standardisation removes ambiguous routing and improves automation readiness.',
    complexityDelta: -7,
    riskDelta: -8,
    confidence: 88,
    affectedObjects: ['RQ.BILLING.01', 'RQ.BILLING.02', 'RQ.PAY.01', 'RQ.SETTLE.01', 'RQ.AUDIT.01', 'RQ.CLAIMS.01'],
  },
  {
    id: 'dec-006',
    category: 'Policy Enforcement',
    subject: 'Dead-letter Queue Gaps',
    change: '3 queue managers missing DLQ — DLQ.* objects added per policy PP-007',
    why: 'HUB-QM-01, INT-QM-02, APP-QM-02 had no dead-letter queue configured. Undeliverable messages would be silently discarded violating operational continuity policy.',
    complexityDelta: 0,
    riskDelta: -19,
    confidence: 100,
    affectedObjects: ['HUB-QM-01', 'INT-QM-02', 'APP-QM-02', 'DLQ.HUB', 'DLQ.INT', 'DLQ.APP02'],
  },
  {
    id: 'dec-007',
    category: 'Risk Mitigation',
    subject: 'APP-QM-02',
    change: 'Degraded status resolved — channel limits addressed by workload redistribution',
    why: 'APP-QM-02 was operating at 94% of max channel limit due to inherited connections from decommissioned INT-QM-03. Connection drain + redistribution restores safe operating headroom.',
    complexityDelta: -4,
    riskDelta: -27,
    confidence: 91,
    affectedObjects: ['APP-QM-02', 'INT-QM-03', 'APP_CLAIMS', 'CHAN.CLAIMS.*'],
  },
  {
    id: 'dec-008',
    category: 'Channel Simplification',
    subject: 'XMIT Channel Consolidation',
    change: 'XMIT_FALLBACK and XMIT_SHADOW eliminated as redundant duplicates',
    why: 'Both channels mirrored XMIT_BILLING with identical target resolution. Redundant definitions were created during a legacy failover design that was superseded but never cleaned up.',
    complexityDelta: -6,
    riskDelta: -5,
    confidence: 93,
    affectedObjects: ['XMIT_FALLBACK', 'XMIT_SHADOW', 'CHAN.BILL.FALLBACK', 'CHAN.BILL.SHADOW'],
  },
]

export const architectureInsights: ArchitectureInsight[] = [
  {
    id: 'ins-001',
    icon: 'network',
    title: 'Reduced App-to-QM Coupling',
    technical: 'Applications moved from shared hub to dedicated queue managers, breaking 9 implicit coupling relationships.',
    operational: 'Any single application failure or QM restart no longer risks cascading impact across unrelated workloads.',
    businessValue: 'Faster incident isolation reduces mean time to resolution (MTTR). New app onboarding no longer requires hub redesign.',
    impact: 'high',
  },
  {
    id: 'ins-002',
    icon: 'route',
    title: 'Deterministic Routing Paths',
    technical: 'Multi-hop transmission chains replaced with direct ownership. Average path depth reduced from 3.4 to 1.2 hops.',
    operational: 'Operations teams can trace any message end-to-end without cross-referencing multiple XMIT configurations.',
    businessValue: 'Reduced operational ambiguity. Support ticket resolution time decreases. On-call complexity reduced significantly.',
    impact: 'high',
  },
  {
    id: 'ins-003',
    icon: 'shield',
    title: 'Compliance Posture Improved',
    technical: 'APP_BILLING and APP_PAYMENTS now run on isolated queue managers satisfying GP-114 and PCI-DSS network segmentation.',
    operational: 'Audit evidence is now cleanly bounded by QM — one QM, one compliance scope.',
    businessValue: 'Reduces audit preparation time. Eliminates risk of cross-scope policy violation findings.',
    impact: 'high',
  },
  {
    id: 'ins-004',
    icon: 'layers',
    title: 'RemoteQ Standardisation',
    technical: '11 remote queue definitions collapsed to 6 canonical aliases following a strict DOMAIN.APP.DIRECTION naming schema.',
    operational: 'Automation tooling can now reliably discover, validate, and update remote queue configurations programmatically.',
    businessValue: 'Enables GitOps-style topology management. Reduces configuration drift. Improves CI/CD pipeline integration.',
    impact: 'medium',
  },
  {
    id: 'ins-005',
    icon: 'explosion',
    title: 'Reduced Failure Blast Radius',
    technical: 'Fan-out from HUB-QM-01 reduced from 7 connected apps to 2. Point-to-point topology replaces star topology.',
    operational: 'A failure at any single QM now affects at most 2 applications, versus the previous 7.',
    businessValue: 'Business continuity SLAs are now achievable per application stream independently of other workloads.',
    impact: 'high',
  },
  {
    id: 'ins-006',
    icon: 'eye',
    title: 'Governance and Auditability',
    technical: 'Dead-letter queues added on all 3 affected QMs. Naming conventions enforced on 100% of objects.',
    operational: 'Every undeliverable message now has a traceable audit trail. Policy compliance is machine-verifiable.',
    businessValue: 'Satisfies regulatory requirements for message durability. Reduces manual compliance checking overhead.',
    impact: 'medium',
  },
]

export const simulationScenarios: SimulationScenario[] = [
  {
    id: 'sim-001',
    label: 'Add New Application',
    description: 'Add APP_CLAIMS to the shared QM_PAYMENTS queue manager',
    icon: 'plus-app',
    effects: [
      { label: 'Complexity Score', delta: +8, unit: 'pts', direction: 'negative' },
      { label: 'Policy Burden', delta: +14, unit: '%', direction: 'negative' },
      { label: 'Fan-out Index', delta: +1.2, unit: '', direction: 'negative' },
      { label: 'Routing Depth', delta: 0, unit: '', direction: 'neutral' },
    ],
    recommendation: 'Consider provisioning a dedicated QM_CLAIMS instead. Co-location with QM_PAYMENTS introduces cross-domain policy scope violation under GP-114.',
    risk: 'medium',
  },
  {
    id: 'sim-002',
    label: 'Merge Two Queue Managers',
    description: 'Merge QM_BILLING and QM_PAYMENTS into a single QM_FINANCIAL',
    icon: 'merge',
    effects: [
      { label: 'Complexity Score', delta: +19, unit: 'pts', direction: 'negative' },
      { label: 'Compliance Risk', delta: +38, unit: '%', direction: 'negative' },
      { label: 'Fan-out Index', delta: +2.4, unit: '', direction: 'negative' },
      { label: 'Infra Cost', delta: -12, unit: '%', direction: 'positive' },
    ],
    recommendation: 'Not recommended. Merging billing and payments violates PCI-DSS network segmentation. Cost saving does not offset the compliance exposure introduced.',
    risk: 'high',
  },
  {
    id: 'sim-003',
    label: 'Remove Orphan Queues',
    description: 'Purge all 6 identified orphan queue objects from the topology',
    icon: 'trash',
    effects: [
      { label: 'Complexity Score', delta: -4, unit: 'pts', direction: 'positive' },
      { label: 'Governance Score', delta: +11, unit: 'pts', direction: 'positive' },
      { label: 'Object Count', delta: -6, unit: 'objects', direction: 'positive' },
      { label: 'Risk', delta: -3, unit: '%', direction: 'positive' },
    ],
    recommendation: 'Safe to execute. All 6 orphan queues show zero message traffic over 180 days. Confirm with application owners before deletion.',
    risk: 'low',
  },
  {
    id: 'sim-004',
    label: 'Standardise All Routing',
    description: 'Apply canonical routing schema to remaining 4 non-standard paths',
    icon: 'route',
    effects: [
      { label: 'Routing Depth Score', delta: -9, unit: 'pts', direction: 'positive' },
      { label: 'Automation Readiness', delta: +22, unit: '%', direction: 'positive' },
      { label: 'Channel Count', delta: -2, unit: 'channels', direction: 'positive' },
      { label: 'Complexity Score', delta: -6, unit: 'pts', direction: 'positive' },
    ],
    recommendation: 'Strongly recommended as a follow-on action. Low risk, high governance benefit. Pairs well with CI/CD pipeline integration.',
    risk: 'low',
  },
  {
    id: 'sim-005',
    label: 'Move App to Dedicated QM',
    description: 'Extract APP_SETTLEMENT from APP-QM-01 to new QM_SETTLEMENT',
    icon: 'move',
    effects: [
      { label: 'Complexity Score', delta: -5, unit: 'pts', direction: 'positive' },
      { label: 'Risk Score', delta: -14, unit: 'pts', direction: 'positive' },
      { label: 'Compliance', delta: +8, unit: '%', direction: 'positive' },
      { label: 'Infra Cost', delta: +7, unit: '%', direction: 'negative' },
    ],
    recommendation: 'Recommended if APP_SETTLEMENT volume exceeds 50K msg/day sustained. Small infra cost is justified by risk reduction and compliance alignment.',
    risk: 'low',
  },
]

export const reviewQueue: ReviewItem[] = [
  {
    id: 'rev-001',
    summary: 'APP_BILLING reassignment to dedicated QM_BILLING',
    category: 'App Assignment',
    status: 'approved',
    confidence: 97,
    owner: 'Sarah Chen',
    subject: 'APP_BILLING → QM_BILLING',
    rationale: 'Compliance isolation + routing depth reduction. Approved per GP-114 review.',
    timestamp: '2024-03-12 14:22',
  },
  {
    id: 'rev-002',
    summary: 'XMIT_LEGACY channel removal',
    category: 'Channel Simplification',
    status: 'approved',
    confidence: 99,
    owner: 'James Okafor',
    subject: 'XMIT_LEGACY',
    rationale: 'Zero traffic confirmed over 90-day window. Orphan validated. Safe to decommission.',
    timestamp: '2024-03-12 14:30',
  },
  {
    id: 'rev-003',
    summary: 'Circular routing loop severance at INT-QM-02',
    category: 'Routing Optimization',
    status: 'approved',
    confidence: 96,
    owner: 'Priya Sharma',
    subject: 'Q.FORWARD.OUT loop',
    rationale: 'Loop confirmed by message trace analysis. Severance point validated with network team.',
    timestamp: '2024-03-12 15:01',
  },
  {
    id: 'rev-004',
    summary: 'APP_PAYMENTS PCI segmentation to QM_PAYMENTS',
    category: 'Policy Enforcement',
    status: 'needs-review',
    confidence: 94,
    owner: 'Unassigned',
    subject: 'APP_PAYMENTS → QM_PAYMENTS',
    rationale: 'Awaiting PCI-DSS scope confirmation from compliance team before proceeding.',
    timestamp: '2024-03-13 09:15',
  },
  {
    id: 'rev-005',
    summary: 'Remote queue alias consolidation (11→6)',
    category: 'Queue Standardization',
    status: 'needs-review',
    confidence: 88,
    owner: 'Marcus Webb',
    subject: 'RQ.* alias group',
    rationale: 'Three application teams need to confirm no hard-coded queue names in application config before consolidation.',
    timestamp: '2024-03-13 10:44',
  },
  {
    id: 'rev-006',
    summary: 'APP-QM-02 channel limit remediation',
    category: 'Risk Mitigation',
    status: 'flagged',
    confidence: 91,
    owner: 'Diego Herrera',
    subject: 'APP-QM-02 / CHAN.CLAIMS.*',
    rationale: 'Connection drain procedure must be coordinated with APP_CLAIMS application team. Window required outside business hours.',
    timestamp: '2024-03-13 11:20',
  },
  {
    id: 'rev-007',
    summary: 'Dead-letter queue provisioning on 3 QMs',
    category: 'Policy Enforcement',
    status: 'approved',
    confidence: 100,
    owner: 'Sarah Chen',
    subject: 'DLQ.HUB / DLQ.INT / DLQ.APP02',
    rationale: 'Standard provisioning. PP-007 compliance. No application changes required.',
    timestamp: '2024-03-13 09:00',
  },
]
