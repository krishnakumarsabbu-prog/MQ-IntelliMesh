export type ArtifactStatus = 'ready' | 'review' | 'generated'
export type ArtifactFormat = 'CSV' | 'JSON' | 'YAML' | 'PDF' | 'DOC' | 'HCL' | 'MQSC'
export type ArtifactCategory = 'CSV' | 'JSON' | 'YAML' | 'Reports' | 'Docs' | 'Automation'

export interface Artifact {
  id: string
  name: string
  description: string
  formats: ArtifactFormat[]
  categories: ArtifactCategory[]
  status: ArtifactStatus
  size: string
  generated: string
  lines?: number
  previewType: 'csv' | 'json' | 'yaml' | 'text' | 'checklist' | 'executive'
}

export interface ReadinessDimension {
  label: string
  score: number
  note: string
}

export interface WorkflowStep {
  id: number
  label: string
  sublabel: string
  status: 'complete' | 'active' | 'pending'
}

export interface ProvisioningTarget {
  id: string
  name: string
  logo: string
  compatibility: 'full' | 'partial' | 'planned'
  exportContract: boolean
  note: string
}

export const artifacts: Artifact[] = [
  {
    id: 'ART-001',
    name: 'Target-State Topology CSV',
    description: 'Flat-file export of all target-state queue managers, queues, channels, and applications with full attribute sets.',
    formats: ['CSV'],
    categories: ['CSV'],
    status: 'ready',
    size: '68 KB',
    generated: '2024-03-15 09:42',
    lines: 1847,
    previewType: 'csv',
  },
  {
    id: 'ART-002',
    name: 'Transformation Diff Report',
    description: 'Structured diff of every added, removed, and modified MQ object between as-is and target topology.',
    formats: ['JSON', 'CSV'],
    categories: ['JSON', 'CSV'],
    status: 'ready',
    size: '112 KB',
    generated: '2024-03-15 09:43',
    lines: 3204,
    previewType: 'json',
  },
  {
    id: 'ART-003',
    name: 'Provisioning Manifest',
    description: 'YAML automation input defining the full target topology in a provisioning-compatible schema for MQ admin tooling.',
    formats: ['YAML'],
    categories: ['YAML', 'Automation'],
    status: 'ready',
    size: '94 KB',
    generated: '2024-03-15 09:44',
    lines: 2611,
    previewType: 'yaml',
  },
  {
    id: 'ART-004',
    name: 'Architecture Decision Log',
    description: 'Full trace of every AI transformation decision with subject, rationale, confidence score, and affected objects.',
    formats: ['JSON', 'DOC'],
    categories: ['JSON', 'Docs'],
    status: 'ready',
    size: '48 KB',
    generated: '2024-03-15 09:44',
    previewType: 'json',
  },
  {
    id: 'ART-005',
    name: 'Validation & Compliance Report',
    description: 'Policy compliance checklist validating 18 resolved violations across GP-114, PP-007, and PCI-DSS alignment.',
    formats: ['PDF', 'DOC'],
    categories: ['Reports', 'Docs'],
    status: 'ready',
    size: '1.4 MB',
    generated: '2024-03-15 09:45',
    previewType: 'checklist',
  },
  {
    id: 'ART-006',
    name: 'Complexity Analysis Report',
    description: 'Full MTCS score breakdown, structural comparison charts, and complexity hotspot analysis exported for governance review.',
    formats: ['PDF'],
    categories: ['Reports'],
    status: 'review',
    size: '2.1 MB',
    generated: '2024-03-15 09:46',
    previewType: 'text',
  },
  {
    id: 'ART-007',
    name: 'Executive Summary Pack',
    description: 'Non-technical summary of transformation outcomes, business value, risk reduction, and architecture confidence for leadership.',
    formats: ['PDF', 'DOC'],
    categories: ['Reports', 'Docs'],
    status: 'ready',
    size: '890 KB',
    generated: '2024-03-15 09:47',
    previewType: 'executive',
  },
  {
    id: 'ART-008',
    name: 'Review & Approval Evidence Pack',
    description: 'Consolidated governance package: approval queue log, architect sign-off records, and transformation audit trail.',
    formats: ['PDF'],
    categories: ['Reports', 'Docs'],
    status: 'generated',
    size: '3.2 MB',
    generated: '2024-03-15 09:48',
    previewType: 'checklist',
  },
]

export const previewContent: Record<string, string> = {
  'ART-001': `QM_NAME,QM_TYPE,OBJECT_TYPE,OBJECT_NAME,QUEUE_TYPE,MAXDEPTH,DEFPSIST,GET,PUT,STATUS
QM_BILLING,DEDICATED,QUEUE,Q.BILLING.IN,LOCAL,250000,YES,ENABLED,ENABLED,ACTIVE
QM_BILLING,DEDICATED,QUEUE,Q.BILLING.OUT,LOCAL,250000,YES,ENABLED,ENABLED,ACTIVE
QM_BILLING,DEDICATED,QUEUE,Q.BILLING.DLQ,LOCAL,50000,YES,ENABLED,ENABLED,ACTIVE
QM_BILLING,DEDICATED,CHANNEL,SVRCONN.BILLING,SVRCONN,,,,,ACTIVE
QM_PAYMENTS,DEDICATED,QUEUE,Q.PAY.IN,LOCAL,500000,YES,ENABLED,ENABLED,ACTIVE
QM_PAYMENTS,DEDICATED,QUEUE,Q.PAY.OUT,LOCAL,500000,YES,ENABLED,ENABLED,ACTIVE
QM_PAYMENTS,DEDICATED,QUEUE,DLQ.PAYMENTS,LOCAL,50000,YES,ENABLED,ENABLED,ACTIVE
QM_PAYMENTS,DEDICATED,CHANNEL,XMIT.PAY.SETTLE,SDR,,,,,ACTIVE
APP-QM-01,SHARED,QUEUE,Q.SETTLE.IN,LOCAL,100000,YES,ENABLED,ENABLED,ACTIVE
APP-QM-01,SHARED,QUEUE,Q.SETTLE.OUT,LOCAL,100000,YES,ENABLED,ENABLED,ACTIVE
APP-QM-01,SHARED,REMOTQ,RQ.BILLING.01,REMOTE,,,,,ACTIVE
APP-QM-01,SHARED,REMOTQ,RQ.PAY.01,REMOTE,,,,,ACTIVE
... (1835 more rows)`,

  'ART-002': `{
  "metadata": {
    "generated": "2024-03-15T09:43:00Z",
    "source_topology": "as-is-v3.2",
    "target_topology": "target-state-v1.0",
    "transformation_id": "TRF-2024-001"
  },
  "summary": {
    "added": 34,
    "removed": 47,
    "modified": 28,
    "unchanged": 312
  },
  "changes": [
    {
      "operation": "ADD",
      "type": "QUEUE_MANAGER",
      "name": "QM_BILLING",
      "reason": "Dedicated QM for APP_BILLING compliance isolation",
      "decision_ref": "DEC-001"
    },
    {
      "operation": "ADD",
      "type": "QUEUE_MANAGER",
      "name": "QM_PAYMENTS",
      "reason": "Dedicated QM for APP_PAYMENTS PCI-DSS segmentation",
      "decision_ref": "DEC-002"
    },
    {
      "operation": "REMOVE",
      "type": "CHANNEL",
      "name": "XMIT_LEGACY",
      "parent_qm": "HUB-QM-01",
      "reason": "Zero traffic 90-day window, orphan confirmed",
      "decision_ref": "DEC-003"
    },
    {
      "operation": "REMOVE",
      "type": "CHANNEL",
      "name": "XMIT_FALLBACK",
      "parent_qm": "HUB-QM-01",
      "reason": "Redundant duplicate of XMIT_BILLING",
      "decision_ref": "DEC-008"
    }
  ]
}`,

  'ART-003': `# MQ IntelliMesh Provisioning Manifest
# Generated: 2024-03-15T09:44:00Z
# Schema: mqim/provisioning/v1.2
# Transformation: TRF-2024-001

apiVersion: mqim/v1
kind: TopologyManifest
metadata:
  name: target-state-v1.0
  environment: production
  owner: platform-engineering
  compliance: [GP-114, PP-007, PCI-DSS]

queueManagers:
  - name: QM_BILLING
    type: dedicated
    application: APP_BILLING
    compliance: [GP-114]
    queues:
      - name: Q.BILLING.IN
        type: LOCAL
        maxdepth: 250000
        persistence: YES
      - name: Q.BILLING.OUT
        type: LOCAL
        maxdepth: 250000
        persistence: YES
      - name: DLQ.BILLING
        type: LOCAL
        maxdepth: 50000
        persistence: YES
    channels:
      - name: SVRCONN.BILLING
        type: SVRCONN
        sslciph: TLS_RSA_WITH_AES_256

  - name: QM_PAYMENTS
    type: dedicated
    application: APP_PAYMENTS
    compliance: [GP-114, PCI-DSS]
    queues:
      - name: Q.PAY.IN
        type: LOCAL
        maxdepth: 500000
        persistence: YES
      - name: Q.PAY.OUT
        type: LOCAL
        maxdepth: 500000
        persistence: YES

# ... (2589 more lines)`,

  'ART-004': `{
  "log_version": "1.0",
  "transformation_id": "TRF-2024-001",
  "total_decisions": 24,
  "decisions": [
    {
      "id": "DEC-001",
      "category": "App Assignment",
      "subject": "APP_BILLING",
      "change": "Moved from HUB-QM-01 to dedicated QM_BILLING",
      "rationale": "Compliance isolation GP-114 + throughput dominance + routing reduction",
      "complexity_delta": -18,
      "risk_delta": -24,
      "confidence": 0.97,
      "affected_objects": ["APP_BILLING","HUB-QM-01","QM_BILLING"]
    },
    {
      "id": "DEC-003",
      "category": "Channel Simplification",
      "subject": "XMIT_LEGACY",
      "change": "Removed zero-traffic orphan channel",
      "rationale": "0 messages in 90-day window. Target Q.LEGACY.TARGET confirmed orphan.",
      "complexity_delta": -9,
      "risk_delta": -6,
      "confidence": 0.99
    }
  ]
}`,
}

export const readinessDimensions: ReadinessDimension[] = [
  { label: 'Topology Completeness', score: 100, note: 'All 421 target objects defined' },
  { label: 'Policy Compliance', score: 100, note: '18/18 violations resolved' },
  { label: 'Naming Standardization', score: 97, note: '11 of 421 objects pending rename' },
  { label: 'Routing Determinism', score: 95, note: 'Circular loop severed, 2 paths under review' },
  { label: 'Provisioning Compatibility', score: 92, note: 'YAML manifest validated against schema v1.2' },
  { label: 'Export Coverage', score: 96, note: '7 of 8 artifact packs generated' },
]

export const workflowSteps: WorkflowStep[] = [
  { id: 1, label: 'Analyse Current Estate', sublabel: 'Topology ingested + validated', status: 'complete' },
  { id: 2, label: 'Generate Target-State', sublabel: 'AI transformation computed', status: 'complete' },
  { id: 3, label: 'Validate Architecture', sublabel: '18 policy violations resolved', status: 'complete' },
  { id: 4, label: 'Produce Delivery Artifacts', sublabel: '7 of 8 artifacts ready', status: 'active' },
  { id: 5, label: 'Submit to Pipeline', sublabel: 'Awaiting architect sign-off', status: 'pending' },
  { id: 6, label: 'Architect Release', sublabel: 'Final approval gate', status: 'pending' },
]

export const provisioningTargets: ProvisioningTarget[] = [
  {
    id: 'pt-001',
    name: 'OpenShift / OCP',
    logo: 'OCP',
    compatibility: 'full',
    exportContract: true,
    note: 'YAML manifest is OCP-compatible. Operator-ready topology definition.',
  },
  {
    id: 'pt-002',
    name: 'Kubernetes',
    logo: 'K8S',
    compatibility: 'full',
    exportContract: true,
    note: 'Manifest compatible with IBM MQ Kubernetes Operator v2.4+',
  },
  {
    id: 'pt-003',
    name: 'Terraform / IaC',
    logo: 'TF',
    compatibility: 'partial',
    exportContract: true,
    note: 'HCL export available. IBM MQ provider integration validated.',
  },
  {
    id: 'pt-004',
    name: 'IBM MQ Admin API',
    logo: 'MQ',
    compatibility: 'full',
    exportContract: true,
    note: 'MQSC scripts and REST API payloads generated for direct admin tooling.',
  },
  {
    id: 'pt-005',
    name: 'AWS',
    logo: 'AWS',
    compatibility: 'partial',
    exportContract: false,
    note: 'Amazon MQ (ActiveMQ) mapping available. IBM MQ native requires custom adapter.',
  },
  {
    id: 'pt-006',
    name: 'Azure Service Bus',
    logo: 'AZ',
    compatibility: 'planned',
    exportContract: false,
    note: 'Planned for Q3 2024. Export contract specification in progress.',
  },
]
