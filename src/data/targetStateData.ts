import type { Node, Edge } from '@xyflow/react'

export const transformationMetrics = {
  complexityReduction: 41,
  policyCompliance: 100,
  channelsReduced: 123,
  avgHopsReduced: 2.4,
  violationsEliminated: 18,
  healthScoreImprovement: 26,
}

export const beforeAfterComparison = {
  before: {
    queueManagers: 47,
    queues: 1247,
    channels: 312,
    avgHops: 4.2,
    complexityScore: 68,
    violations: 18,
    orphanObjects: 11,
    redundantChannels: 71,
  },
  after: {
    queueManagers: 28,
    queues: 843,
    channels: 189,
    avgHops: 1.8,
    complexityScore: 34,
    violations: 0,
    orphanObjects: 0,
    redundantChannels: 0,
  },
}

export const diffSummary = [
  {
    id: 'd1',
    type: 'removed' as const,
    icon: 'trash',
    label: '14 redundant channels removed',
    detail: 'Sender/receiver pairs with zero traffic eliminated from QM_HUB_01 and QM_PAYMENTS',
    impact: 'high',
  },
  {
    id: 'd2',
    type: 'removed' as const,
    icon: 'trash',
    label: '9 orphan queues eliminated',
    detail: 'Local queues with no active producers or consumers purged from QM_BILLING and QM_HUB_01',
    impact: 'medium',
  },
  {
    id: 'd3',
    type: 'added' as const,
    icon: 'plus',
    label: '6 xmitQ patterns introduced',
    detail: 'Transmission queues standardized across all inter-QM channels for consistent routing',
    impact: 'high',
  },
  {
    id: 'd4',
    type: 'changed' as const,
    icon: 'arrow',
    label: '8 remoteQ abstractions standardized',
    detail: 'Producer applications now use remoteQ pattern instead of direct QM binding',
    impact: 'high',
  },
  {
    id: 'd5',
    type: 'changed' as const,
    icon: 'arrow',
    label: '11 apps consolidated to single-QM ownership',
    detail: 'Multi-QM dependent applications rationalized to single owning queue manager',
    impact: 'high',
  },
  {
    id: 'd6',
    type: 'added' as const,
    icon: 'check',
    label: '100% producer-consumer flow preserved',
    detail: 'All message paths validated end-to-end in target architecture. Zero data loss.',
    impact: 'critical',
  },
]

export const transformationDecisions = [
  {
    id: 'td1',
    subject: 'APP_SETTLEMENT',
    change: 'Assigned exclusively to QM_SETTLEMENT',
    reason: 'APP_SETTLEMENT previously connected to QM_PAYMENTS and QM_BILLING. Single-QM ownership eliminates cross-domain coupling and reduces failure surface.',
    benefit: 'Reduces inter-domain dependencies by 67%. Simplifies ownership model.',
    confidence: 96,
    type: 'ownership' as const,
  },
  {
    id: 'td2',
    subject: 'QM_HUB_01 → QM_PAYMENTS direct channel',
    change: 'Direct channel removed. Replaced with remoteQ-based routing.',
    reason: 'Direct channel created an implicit topology cycle and bypassed standard routing conventions.',
    benefit: 'Eliminates 1 topology cycle. Enforces deterministic routing. Channel count -1.',
    confidence: 91,
    type: 'routing' as const,
  },
  {
    id: 'td3',
    subject: 'Q.ORDERS.OUT',
    change: 'Standardized to remoteQ pattern on QM_PAYMENTS',
    reason: 'Application was directly bound to queue manager object. RemoteQ abstraction decouples app from physical QM location.',
    benefit: 'Enables future QM migration without application change. Simplifies testing.',
    confidence: 89,
    type: 'pattern' as const,
  },
  {
    id: 'td4',
    subject: 'APP_BILLING',
    change: 'Reduced from 3 QM connections to 1 (QM_BILLING)',
    reason: 'APP_BILLING was connecting to QM_PAYMENTS, QM_HUB_01, and QM_BILLING. Analysis confirmed all required queues can be served from QM_BILLING alone.',
    benefit: 'Removes 2 cross-domain dependencies. Reduces channel count by 4.',
    confidence: 94,
    type: 'ownership' as const,
  },
  {
    id: 'td5',
    subject: 'QM_HUB_01 consolidation',
    change: 'Merged into CORE_QM_01 — primary routing hub',
    reason: 'QM_HUB_01 contained 18 app connections with no logical domain boundary. Renaming and refactoring as CORE_QM_01 enforces hub contract.',
    benefit: 'Establishes explicit hub contract. Reduces ad-hoc connections by 38%.',
    confidence: 88,
    type: 'consolidation' as const,
  },
]

export const validationChecks = [
  { id: 'v1', label: 'One Queue Manager per application enforced', passed: true, category: 'Architecture' },
  { id: 'v2', label: 'Producers use remoteQ pattern throughout', passed: true, category: 'Pattern' },
  { id: 'v3', label: 'Consumers read only from local queues', passed: true, category: 'Pattern' },
  { id: 'v4', label: 'Deterministic channel naming enforced', passed: true, category: 'Governance' },
  { id: 'v5', label: 'Redundant paths eliminated (0 remaining)', passed: true, category: 'Optimization' },
  { id: 'v6', label: 'Invalid routing paths removed', passed: true, category: 'Routing' },
  { id: 'v7', label: 'Full message reachability preserved', passed: true, category: 'Validation' },
  { id: 'v8', label: 'Zero policy violations in target state', passed: true, category: 'Compliance' },
  { id: 'v9', label: 'All orphan objects removed', passed: true, category: 'Cleanup' },
  { id: 'v10', label: 'Automation artifact export ready', passed: true, category: 'Export' },
  { id: 'v11', label: 'Dead-letter queue configured on all QMs', passed: true, category: 'Resilience' },
  { id: 'v12', label: 'SSL/TLS enforced on all inter-QM channels', passed: true, category: 'Security' },
]

export const transformationTimeline = [
  { step: 1, label: 'Inventory Analyzed', detail: '847 objects discovered', done: true },
  { step: 2, label: 'Violations Detected', detail: '18 policy, 7 cycles', done: true },
  { step: 3, label: 'App Ownership Rationalized', detail: '11 apps consolidated', done: true },
  { step: 4, label: 'Routing Simplified', detail: 'RemoteQ + xmitQ applied', done: true },
  { step: 5, label: 'Target State Generated', detail: '28 QMs, 189 channels', done: true },
  { step: 6, label: 'Validation Passed', detail: '12/12 checks green', done: true },
]

export const targetNodes: Node<Record<string, unknown>>[] = [
  {
    id: 't-app-payments',
    type: 'app',
    position: { x: 40, y: 60 },
    data: { label: 'APP_PAYMENTS', role: 'Mixed', connections: 2, risk: 'low', region: 'Payments Domain' },
  },
  {
    id: 't-app-settlement',
    type: 'app',
    position: { x: 40, y: 240 },
    data: { label: 'APP_SETTLEMENT', role: 'Consumer', connections: 1, risk: 'low', region: 'Payments Domain' },
  },
  {
    id: 't-app-billing',
    type: 'app',
    position: { x: 40, y: 420 },
    data: { label: 'APP_BILLING', role: 'Producer', connections: 1, risk: 'low', region: 'Billing Domain' },
  },
  {
    id: 't-app-fraud',
    type: 'app',
    position: { x: 40, y: 590 },
    data: { label: 'APP_FRAUD_ENGINE', role: 'Consumer', connections: 1, risk: 'low', region: 'Risk Domain' },
  },
  {
    id: 't-app-reporting',
    type: 'app',
    position: { x: 40, y: 740 },
    data: { label: 'APP_REPORTING', role: 'Consumer', connections: 1, risk: 'low', region: 'Analytics Domain' },
  },

  {
    id: 't-qm-payments',
    type: 'queueManager',
    position: { x: 320, y: 80 },
    data: { label: 'QM_PAYMENTS', region: 'Payments Domain', queues: 18, channels: 6, apps: 1, risk: 'low' },
  },
  {
    id: 't-qm-settlement',
    type: 'queueManager',
    position: { x: 320, y: 260 },
    data: { label: 'QM_SETTLEMENT', region: 'Payments Domain', queues: 14, channels: 5, apps: 1, risk: 'low' },
  },
  {
    id: 't-qm-billing',
    type: 'queueManager',
    position: { x: 320, y: 440 },
    data: { label: 'QM_BILLING', region: 'Billing Domain', queues: 10, channels: 4, apps: 1, risk: 'low' },
  },
  {
    id: 't-qm-core',
    type: 'queueManager',
    position: { x: 320, y: 620 },
    data: { label: 'CORE_QM_01', region: 'Core Infrastructure', queues: 28, channels: 12, apps: 2, risk: 'low' },
  },

  {
    id: 't-rq-orders',
    type: 'queue',
    position: { x: 590, y: 60 },
    data: { label: 'REMOTE.ORDERS.SETTLE', subtype: 'remote', owner: 'QM_PAYMENTS', risk: 'none' },
  },
  {
    id: 't-q-orders-in',
    type: 'queue',
    position: { x: 590, y: 200 },
    data: { label: 'Q.ORDERS.IN', subtype: 'local', owner: 'QM_SETTLEMENT', depth: 12, maxDepth: 10000, risk: 'none' },
  },
  {
    id: 't-rq-billing',
    type: 'queue',
    position: { x: 590, y: 380 },
    data: { label: 'REMOTE.BILLING.CORE', subtype: 'remote', owner: 'QM_BILLING', risk: 'none' },
  },
  {
    id: 't-q-billing-events',
    type: 'queue',
    position: { x: 590, y: 500 },
    data: { label: 'Q.BILLING.EVENTS', subtype: 'local', owner: 'CORE_QM_01', depth: 0, maxDepth: 5000, risk: 'none' },
  },
  {
    id: 't-q-fraud-alerts',
    type: 'queue',
    position: { x: 590, y: 620 },
    data: { label: 'Q.FRAUD.ALERTS', subtype: 'local', owner: 'CORE_QM_01', depth: 4, maxDepth: 2000, risk: 'none' },
  },
  {
    id: 't-q-reports',
    type: 'queue',
    position: { x: 590, y: 740 },
    data: { label: 'Q.REPORTS.IN', subtype: 'local', owner: 'CORE_QM_01', depth: 0, maxDepth: 5000, risk: 'none' },
  },

  {
    id: 't-xmit-pay-settle',
    type: 'queue',
    position: { x: 840, y: 130 },
    data: { label: 'XMIT.PAY.SETTLE', subtype: 'xmitq', owner: 'QM_PAYMENTS', depth: 2, maxDepth: 5000, risk: 'none' },
  },
  {
    id: 't-xmit-bill-core',
    type: 'queue',
    position: { x: 840, y: 440 },
    data: { label: 'XMIT.BILL.CORE', subtype: 'xmitq', owner: 'QM_BILLING', depth: 0, maxDepth: 5000, risk: 'none' },
  },
]

const eStyle = (color: string, width = 1.5) => ({
  animated: true,
  style: { stroke: color, strokeWidth: width },
})

export const targetEdges: Edge[] = [
  { id: 'te1', source: 't-app-payments', target: 't-qm-payments', ...eStyle('#10B981', 2) },
  { id: 'te2', source: 't-app-settlement', target: 't-qm-settlement', ...eStyle('#10B981', 2) },
  { id: 'te3', source: 't-app-billing', target: 't-qm-billing', ...eStyle('#10B981', 2) },
  { id: 'te4', source: 't-app-fraud', target: 't-qm-core', ...eStyle('#10B981', 2) },
  { id: 'te5', source: 't-app-reporting', target: 't-qm-core', ...eStyle('#10B981', 2) },

  { id: 'te6', source: 't-qm-payments', target: 't-rq-orders', ...eStyle('#8B5CF6') },
  { id: 'te7', source: 't-qm-settlement', target: 't-q-orders-in', ...eStyle('#06B6D4') },
  { id: 'te8', source: 't-qm-billing', target: 't-rq-billing', ...eStyle('#8B5CF6') },
  { id: 'te9', source: 't-qm-core', target: 't-q-billing-events', ...eStyle('#06B6D4') },
  { id: 'te10', source: 't-qm-core', target: 't-q-fraud-alerts', ...eStyle('#06B6D4') },
  { id: 'te11', source: 't-qm-core', target: 't-q-reports', ...eStyle('#06B6D4') },

  { id: 'te12', source: 't-rq-orders', target: 't-xmit-pay-settle', ...eStyle('#F59E0B') },
  { id: 'te13', source: 't-rq-billing', target: 't-xmit-bill-core', ...eStyle('#F59E0B') },

  {
    id: 'te14',
    source: 't-xmit-pay-settle',
    target: 't-q-orders-in',
    animated: true,
    style: { stroke: '#10B981', strokeWidth: 2 },
    label: 'CHANNEL',
    labelStyle: { fill: '#10B981', fontSize: 9, fontFamily: 'JetBrains Mono' },
    labelBgStyle: { fill: '#0F172A', fillOpacity: 0.9 },
  },
  {
    id: 'te15',
    source: 't-xmit-bill-core',
    target: 't-q-billing-events',
    animated: true,
    style: { stroke: '#10B981', strokeWidth: 2 },
    label: 'CHANNEL',
    labelStyle: { fill: '#10B981', fontSize: 9, fontFamily: 'JetBrains Mono' },
    labelBgStyle: { fill: '#0F172A', fillOpacity: 0.9 },
  },
]
