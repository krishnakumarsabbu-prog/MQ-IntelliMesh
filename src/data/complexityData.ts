export const mtcsScores = {
  asIs: 68,
  target: 34,
  reduction: 41,
  maxPossible: 100,
  grade: {
    asIs: 'Critical' as const,
    target: 'Optimized' as const,
  },
}

export interface DimensionScore {
  id: string
  name: string
  shortName: string
  weight: number
  asIs: number
  target: number
  improvement: number
  explanation: string
  color: string
}

export const dimensions: DimensionScore[] = [
  {
    id: 'app-connectivity',
    name: 'Application Connectivity Complexity',
    shortName: 'App Connectivity',
    weight: 0.18,
    asIs: 76,
    target: 28,
    improvement: 63,
    explanation: 'Measures how many queue managers each application connects to and the coupling breadth of application-to-QM bindings.',
    color: '#3B82F6',
  },
  {
    id: 'qm-sprawl',
    name: 'Queue Manager Sprawl',
    shortName: 'QM Sprawl',
    weight: 0.14,
    asIs: 72,
    target: 38,
    improvement: 47,
    explanation: 'Quantifies the total number of queue managers relative to the topology footprint and the governance overhead this creates.',
    color: '#06B6D4',
  },
  {
    id: 'channel-complexity',
    name: 'Channel Complexity',
    shortName: 'Channel Complexity',
    weight: 0.16,
    asIs: 81,
    target: 42,
    improvement: 48,
    explanation: 'Counts active channels, redundant sender-receiver pairs, and idle channels relative to the number of productive paths.',
    color: '#8B5CF6',
  },
  {
    id: 'routing-complexity',
    name: 'Routing Complexity',
    shortName: 'Routing',
    weight: 0.14,
    asIs: 74,
    target: 31,
    improvement: 58,
    explanation: 'Measures routing hop depth, the number of cycles in message paths, and the presence of non-deterministic routing decisions.',
    color: '#10B981',
  },
  {
    id: 'fanout-risk',
    name: 'Fan-In / Fan-Out Risk',
    shortName: 'Fan-Out Risk',
    weight: 0.12,
    asIs: 88,
    target: 32,
    improvement: 64,
    explanation: 'Evaluates concentration of connections on hub queue managers and the blast radius risk from hub failures.',
    color: '#F59E0B',
  },
  {
    id: 'policy-violations',
    name: 'Policy Violation Burden',
    shortName: 'Policy Violations',
    weight: 0.12,
    asIs: 62,
    target: 0,
    improvement: 100,
    explanation: 'Penalizes the estate for every active policy violation weighted by severity — missing DLQ, disabled auth, SSL gaps.',
    color: '#EF4444',
  },
  {
    id: 'redundancy',
    name: 'Redundancy / Orphan Waste',
    shortName: 'Redundancy',
    weight: 0.08,
    asIs: 54,
    target: 0,
    improvement: 100,
    explanation: 'Measures wasted structural surface area from redundant channels, orphan queues, and unused objects.',
    color: '#F97316',
  },
  {
    id: 'entropy',
    name: 'Structural Entropy',
    shortName: 'Entropy',
    weight: 0.06,
    asIs: 49,
    target: 22,
    improvement: 55,
    explanation: 'A graph-theoretic measure of disorder — captures naming inconsistencies, asymmetric routing, and configuration drift.',
    color: '#A78BFA',
  },
]

export const formulaWeights = dimensions.map(d => ({
  label: d.shortName,
  weight: d.weight,
  weightPct: Math.round(d.weight * 100),
}))

export const hotspots = [
  {
    id: 'h1',
    name: 'QM_HUB_01',
    type: 'Queue Manager',
    issue: 'Excessive fan-out hub: 18 connected applications',
    severity: 'critical' as const,
    contribution: 18.4,
    detail: 'QM_HUB_01 is the highest-complexity single object in the estate. It acts as an unintentional aggregate hub with 18 application connections, 42 channels, and creates a single point of failure for the entire topology.',
  },
  {
    id: 'h2',
    name: 'APP_BILLING',
    type: 'Application',
    issue: 'Spans 3 queue managers — high cross-domain coupling',
    severity: 'high' as const,
    contribution: 9.2,
    detail: 'APP_BILLING connects to QM_PAYMENTS, QM_HUB_01, and QM_BILLING. This cross-domain coupling raises operational risk and makes the application brittle to any topology change.',
  },
  {
    id: 'h3',
    name: '13 Redundant Channel Pairs',
    type: 'Channel Group',
    issue: 'Parallel routes with zero differentiation',
    severity: 'high' as const,
    contribution: 8.7,
    detail: '13 sender-receiver channel pairs connect identical source-destination QM combinations without load differentiation or failover justification. They add configuration surface with no architectural value.',
  },
  {
    id: 'h4',
    name: 'QM_PAYMENTS',
    type: 'Queue Manager',
    issue: 'Policy violations: missing DLQ, auth disabled',
    severity: 'critical' as const,
    contribution: 7.6,
    detail: 'QM_PAYMENTS is operating without a dead-letter queue and with channel authentication disabled. Both are critical policy gaps on a high-traffic payments queue manager.',
  },
  {
    id: 'h5',
    name: '11 Orphan Objects',
    type: 'Object Group',
    issue: 'Structural noise with no active consumers or producers',
    severity: 'medium' as const,
    contribution: 5.1,
    detail: '11 queues have had zero traffic for 90+ days and have no active application bindings. They inflate the structural surface area of the topology graph and complicate analysis.',
  },
]

export const impactMetrics = [
  { id: 'i1', label: 'Routing Depth', before: 4.2, after: 1.8, unit: 'hops', reduction: 57, icon: 'routing' },
  { id: 'i2', label: 'Channel Burden', before: 312, after: 189, unit: 'channels', reduction: 39, icon: 'channel' },
  { id: 'i3', label: 'Policy Violations', before: 18, after: 0, unit: 'violations', reduction: 100, icon: 'policy' },
  { id: 'i4', label: 'Graph Density', before: 0.72, after: 0.41, unit: 'index', reduction: 43, icon: 'graph' },
  { id: 'i5', label: 'Fan-Out Score', before: 88, after: 32, unit: 'pts', reduction: 64, icon: 'fanout' },
  { id: 'i6', label: 'Structural Entropy', before: 49, after: 22, unit: 'pts', reduction: 55, icon: 'entropy' },
]

export const radarData = [
  { dimension: 'App Connect', asIs: 76, target: 28, fullMark: 100 },
  { dimension: 'QM Sprawl', asIs: 72, target: 38, fullMark: 100 },
  { dimension: 'Channels', asIs: 81, target: 42, fullMark: 100 },
  { dimension: 'Routing', asIs: 74, target: 31, fullMark: 100 },
  { dimension: 'Fan-Out', asIs: 88, target: 32, fullMark: 100 },
  { dimension: 'Policy', asIs: 62, target: 0, fullMark: 100 },
  { dimension: 'Redundancy', asIs: 54, target: 0, fullMark: 100 },
  { dimension: 'Entropy', asIs: 49, target: 22, fullMark: 100 },
]

export const barData = dimensions.map(d => ({
  name: d.shortName,
  asIs: d.asIs,
  target: d.target,
  weight: Math.round(d.weight * 100),
}))

export const executiveInsights = [
  {
    id: 'e1',
    title: 'Lower routing complexity reduces operational fragility',
    detail: 'A 58% reduction in average routing hops means message paths are more deterministic. Fewer hops mean fewer failure points and simpler runbook procedures for operations teams.',
    icon: 'routing',
  },
  {
    id: 'e2',
    title: 'Fewer inter-QM channels reduce support overhead',
    detail: '123 fewer channels translates directly to fewer configuration items to monitor, audit, and maintain. This reduces MTTR and lowers the blast radius of channel failures.',
    icon: 'channel',
  },
  {
    id: 'e3',
    title: 'Single-QM ownership improves governance and onboarding',
    detail: 'When each application owns exactly one queue manager, team ownership is clear, cost allocation is deterministic, and new developers can reason about the topology without deep tribal knowledge.',
    icon: 'governance',
  },
  {
    id: 'e4',
    title: 'Standardized routing improves automation readiness',
    detail: 'RemoteQ + xmitQ patterns are template-driven. A standardized topology is directly scriptable — enabling Infrastructure as Code, automated validation, and continuous compliance checking.',
    icon: 'automation',
  },
  {
    id: 'e5',
    title: 'Reduced structural entropy improves explainability',
    detail: 'A 55% drop in structural entropy means the topology is easier to document, visualize, and reason about. This directly reduces cognitive load for architects and auditors.',
    icon: 'entropy',
  },
]

export const assumptionItems = [
  'Scoring is based on the authoritative topology dataset ingested during discovery phase',
  'All metrics are normalized to a 0–100 scale for dimensional fairness',
  'MTCS scores are deterministic — identical topology inputs produce identical scores',
  'Weights are configured for IBM MQ enterprise operational patterns',
  'Score is intended for comparative architecture evaluation, not absolute benchmarking',
  'Improvements reflect full implementation of the AI-generated target-state architecture',
]
