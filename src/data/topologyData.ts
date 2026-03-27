import type { Node, Edge } from '@xyflow/react'

export type NodeType = 'app' | 'queueManager' | 'queue'
export type QueueSubtype = 'local' | 'remote' | 'xmitq'
export type RiskLevel = 'high' | 'medium' | 'low' | 'none'
export type AppRole = 'Producer' | 'Consumer' | 'Mixed'

export interface AppNodeData {
  label: string
  role: AppRole
  connections: number
  risk: RiskLevel
  region: string
  issues?: string[]
  description?: string
  [key: string]: unknown
}

export interface QMNodeData {
  label: string
  region: string
  queues: number
  channels: number
  apps: number
  risk: RiskLevel
  issues?: string[]
  description?: string
  [key: string]: unknown
}

export interface QueueNodeData {
  label: string
  subtype: QueueSubtype
  owner: string
  depth?: number
  maxDepth?: number
  risk: RiskLevel
  issues?: string[]
  description?: string
  [key: string]: unknown
}

export type TopologyNodeData = AppNodeData | QMNodeData | QueueNodeData

export interface TopologyFiltersState {
  label?: string
  risk?: string
  subtype?: string
  [key: string]: unknown
}

const SPACING = { x: 260, y: 160 }

export const initialNodes: Node<TopologyNodeData>[] = [
  {
    id: 'app-payments',
    type: 'app',
    position: { x: 40, y: 80 },
    data: {
      label: 'APP_PAYMENTS',
      role: 'Mixed',
      connections: 8,
      risk: 'high',
      region: 'Payments Domain',
      description: 'Core payments processing application. High fan-out to 3 queue managers.',
      issues: ['Multi-QM dependency detected', 'High fan-out: 8 connections', 'Direct QM binding — no remoteQ abstraction'],
    },
  },
  {
    id: 'app-settlement',
    type: 'app',
    position: { x: 40, y: 280 },
    data: {
      label: 'APP_SETTLEMENT',
      role: 'Consumer',
      connections: 4,
      risk: 'medium',
      region: 'Payments Domain',
      description: 'Settlement processing application consuming from payments and billing domains.',
      issues: ['Cross-domain consumer dependency'],
    },
  },
  {
    id: 'app-billing',
    type: 'app',
    position: { x: 40, y: 480 },
    data: {
      label: 'APP_BILLING',
      role: 'Producer',
      connections: 3,
      risk: 'low',
      region: 'Billing Domain',
      description: 'Billing event producer. Well-structured with low connectivity footprint.',
      issues: [],
    },
  },
  {
    id: 'app-fraud',
    type: 'app',
    position: { x: 40, y: 680 },
    data: {
      label: 'APP_FRAUD_ENGINE',
      role: 'Consumer',
      connections: 5,
      risk: 'medium',
      region: 'Risk Domain',
      description: 'Fraud detection engine consuming events from multiple upstream queue managers.',
      issues: ['Multi-QM consumer: 3 queue managers', 'Missing redundancy on critical path'],
    },
  },
  {
    id: 'app-reporting',
    type: 'app',
    position: { x: 40, y: 860 },
    data: {
      label: 'APP_REPORTING',
      role: 'Consumer',
      connections: 2,
      risk: 'low',
      region: 'Analytics Domain',
      description: 'Reporting application with minimal footprint and clean dependency structure.',
      issues: [],
    },
  },

  {
    id: 'qm-payments',
    type: 'queueManager',
    position: { x: 380, y: 120 },
    data: {
      label: 'QM_PAYMENTS',
      region: 'Payments Domain',
      queues: 34,
      channels: 18,
      apps: 6,
      risk: 'high',
      description: 'Primary payments queue manager. High-traffic hub with 6 connected applications and 18 active channels.',
      issues: ['High fan-out hub: 6 apps', 'Missing dead-letter queue config', 'Policy violation: channel auth disabled', 'CPU utilization > 85% observed'],
    },
  },
  {
    id: 'qm-settlement',
    type: 'queueManager',
    position: { x: 380, y: 380 },
    data: {
      label: 'QM_SETTLEMENT',
      region: 'Payments Domain',
      queues: 22,
      channels: 11,
      apps: 4,
      risk: 'medium',
      description: 'Settlement domain queue manager. Moderate complexity with cross-domain channels.',
      issues: ['Topology cycle with QM_PAYMENTS', '3 redundant sender-receiver pairs'],
    },
  },
  {
    id: 'qm-billing',
    type: 'queueManager',
    position: { x: 380, y: 620 },
    data: {
      label: 'QM_BILLING',
      region: 'Billing Domain',
      queues: 18,
      channels: 8,
      apps: 3,
      risk: 'low',
      description: 'Billing queue manager with clean topology and low complexity.',
      issues: [],
    },
  },
  {
    id: 'qm-hub',
    type: 'queueManager',
    position: { x: 380, y: 840 },
    data: {
      label: 'QM_HUB_01',
      region: 'Core Infrastructure',
      queues: 68,
      channels: 42,
      apps: 18,
      risk: 'high',
      description: 'Central hub queue manager. Single point of failure. 18 connected applications — primary consolidation candidate.',
      issues: ['Single point of failure', 'Highest fan-out in estate: 18 apps', 'Hub concentration risk: critical', '7 idle channels (30d no traffic)', 'Policy violation: SSL not enforced'],
    },
  },

  {
    id: 'q-orders-in',
    type: 'queue',
    position: { x: SPACING.x * 2.8, y: 60 },
    data: {
      label: 'Q.ORDERS.IN',
      subtype: 'local',
      owner: 'QM_PAYMENTS',
      depth: 1240,
      maxDepth: 10000,
      risk: 'medium',
      description: 'Inbound orders queue. High current depth — monitor for backpressure.',
      issues: ['Current depth: 1,240 msgs', 'Peak depth alert threshold approaching'],
    },
  },
  {
    id: 'q-orders-out',
    type: 'queue',
    position: { x: SPACING.x * 2.8, y: 200 },
    data: {
      label: 'Q.ORDERS.OUT',
      subtype: 'local',
      owner: 'QM_PAYMENTS',
      depth: 3,
      maxDepth: 10000,
      risk: 'none',
      description: 'Outbound orders queue. Healthy state with low message depth.',
      issues: [],
    },
  },
  {
    id: 'q-payment-req',
    type: 'queue',
    position: { x: SPACING.x * 2.8, y: 340 },
    data: {
      label: 'Q.PAYMENT.REQ',
      subtype: 'local',
      owner: 'QM_PAYMENTS',
      depth: 88,
      maxDepth: 5000,
      risk: 'low',
      description: 'Payment request queue. Normal operating state.',
      issues: [],
    },
  },
  {
    id: 'q-settle-in',
    type: 'queue',
    position: { x: SPACING.x * 2.8, y: 480 },
    data: {
      label: 'Q.SETTLE.IN',
      subtype: 'local',
      owner: 'QM_SETTLEMENT',
      depth: 211,
      maxDepth: 5000,
      risk: 'none',
      description: 'Settlement inbound queue. Healthy with moderate current depth.',
      issues: [],
    },
  },
  {
    id: 'q-billing-events',
    type: 'queue',
    position: { x: SPACING.x * 2.8, y: 620 },
    data: {
      label: 'Q.BILLING.EVENTS',
      subtype: 'local',
      owner: 'QM_BILLING',
      depth: 0,
      maxDepth: 5000,
      risk: 'none',
      description: 'Billing events queue. Low-traffic queue in healthy state.',
      issues: [],
    },
  },
  {
    id: 'q-fraud-alerts',
    type: 'queue',
    position: { x: SPACING.x * 2.8, y: 760 },
    data: {
      label: 'Q.FRAUD.ALERTS',
      subtype: 'local',
      owner: 'QM_HUB_01',
      depth: 44,
      maxDepth: 2000,
      risk: 'low',
      description: 'Fraud alert queue routed through central hub.',
      issues: ['Routed via high-risk hub QM_HUB_01'],
    },
  },
  {
    id: 'q-orphan',
    type: 'queue',
    position: { x: SPACING.x * 2.8, y: 900 },
    data: {
      label: 'Q.LEGACY.BATCH',
      subtype: 'local',
      owner: 'QM_HUB_01',
      depth: 0,
      maxDepth: 1000,
      risk: 'medium',
      description: 'Orphaned legacy queue. No active producers or consumers detected in 90 days.',
      issues: ['Orphan object: no active producers', 'No active consumers (90d)', 'Cleanup candidate'],
    },
  },

  {
    id: 'q-remote-settle',
    type: 'queue',
    position: { x: SPACING.x * 4, y: 300 },
    data: {
      label: 'RQ.SETTLE.PAY',
      subtype: 'remote',
      owner: 'QM_PAYMENTS',
      risk: 'low',
      description: 'Remote queue alias for settlement-bound messages from payments QM.',
      issues: [],
    },
  },
  {
    id: 'q-remote-billing',
    type: 'queue',
    position: { x: SPACING.x * 4, y: 500 },
    data: {
      label: 'RQ.BILLING.HUB',
      subtype: 'remote',
      owner: 'QM_HUB_01',
      risk: 'low',
      description: 'Remote queue routing billing events through the central hub.',
      issues: [],
    },
  },

  {
    id: 'q-xmit-pay-settle',
    type: 'queue',
    position: { x: SPACING.x * 5.1, y: 200 },
    data: {
      label: 'XMIT.PAY.SETTLE',
      subtype: 'xmitq',
      owner: 'QM_PAYMENTS',
      depth: 12,
      maxDepth: 5000,
      risk: 'none',
      description: 'Transmission queue for payments to settlement channel.',
      issues: [],
    },
  },
  {
    id: 'q-xmit-hub-pay',
    type: 'queue',
    position: { x: SPACING.x * 5.1, y: 400 },
    data: {
      label: 'XMIT.HUB.PAY',
      subtype: 'xmitq',
      owner: 'QM_HUB_01',
      depth: 0,
      maxDepth: 5000,
      risk: 'medium',
      description: 'Transmission queue for hub-to-payments channel. Currently idle.',
      issues: ['Idle channel: 0 msgs / 30 days', 'Potential redundant path'],
    },
  },
]

const edgeDefaults = {
  animated: true,
  style: { stroke: '#334155', strokeWidth: 1.5 },
}

export const initialEdges: Edge[] = [
  { id: 'e-app-pay-qm-pay', source: 'app-payments', target: 'qm-payments', ...edgeDefaults, style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e-app-pay-qm-hub', source: 'app-payments', target: 'qm-hub', ...edgeDefaults, style: { stroke: '#EF4444', strokeWidth: 2 } },
  { id: 'e-app-settle-qm-settle', source: 'app-settlement', target: 'qm-settlement', ...edgeDefaults },
  { id: 'e-app-settle-qm-pay', source: 'app-settlement', target: 'qm-payments', ...edgeDefaults },
  { id: 'e-app-billing-qm-billing', source: 'app-billing', target: 'qm-billing', ...edgeDefaults, style: { stroke: '#10B981', strokeWidth: 1.5 } },
  { id: 'e-app-fraud-qm-hub', source: 'app-fraud', target: 'qm-hub', ...edgeDefaults },
  { id: 'e-app-fraud-qm-settle', source: 'app-fraud', target: 'qm-settlement', ...edgeDefaults },
  { id: 'e-app-reporting-qm-hub', source: 'app-reporting', target: 'qm-hub', ...edgeDefaults, style: { stroke: '#10B981', strokeWidth: 1.5 } },

  { id: 'e-qm-pay-q-orders-in', source: 'qm-payments', target: 'q-orders-in', ...edgeDefaults, style: { stroke: '#06B6D4', strokeWidth: 1.5 } },
  { id: 'e-qm-pay-q-orders-out', source: 'qm-payments', target: 'q-orders-out', ...edgeDefaults, style: { stroke: '#06B6D4', strokeWidth: 1.5 } },
  { id: 'e-qm-pay-q-payment-req', source: 'qm-payments', target: 'q-payment-req', ...edgeDefaults, style: { stroke: '#06B6D4', strokeWidth: 1.5 } },
  { id: 'e-qm-settle-q-settle-in', source: 'qm-settlement', target: 'q-settle-in', ...edgeDefaults, style: { stroke: '#06B6D4', strokeWidth: 1.5 } },
  { id: 'e-qm-billing-q-billing', source: 'qm-billing', target: 'q-billing-events', ...edgeDefaults, style: { stroke: '#06B6D4', strokeWidth: 1.5 } },
  { id: 'e-qm-hub-q-fraud', source: 'qm-hub', target: 'q-fraud-alerts', ...edgeDefaults, style: { stroke: '#F59E0B', strokeWidth: 1.5 } },
  { id: 'e-qm-hub-q-orphan', source: 'qm-hub', target: 'q-orphan', ...edgeDefaults, style: { stroke: '#EF4444', strokeWidth: 1, strokeDasharray: '4 4' } },

  { id: 'e-qm-pay-rq-settle', source: 'qm-payments', target: 'q-remote-settle', ...edgeDefaults, style: { stroke: '#8B5CF6', strokeWidth: 1.5 } },
  { id: 'e-qm-hub-rq-billing', source: 'qm-hub', target: 'q-remote-billing', ...edgeDefaults, style: { stroke: '#8B5CF6', strokeWidth: 1.5 } },

  { id: 'e-qm-pay-xmit-pay', source: 'qm-payments', target: 'q-xmit-pay-settle', ...edgeDefaults, style: { stroke: '#F59E0B', strokeWidth: 1.5 } },
  { id: 'e-qm-hub-xmit-hub', source: 'qm-hub', target: 'q-xmit-hub-pay', ...edgeDefaults, style: { stroke: '#F59E0B', strokeWidth: 1, strokeDasharray: '4 4' } },

  {
    id: 'e-qm-pay-qm-settle',
    source: 'qm-payments',
    target: 'qm-settlement',
    animated: true,
    style: { stroke: '#EF4444', strokeWidth: 2 },
    label: 'CHANNEL (cycle risk)',
    labelStyle: { fill: '#EF4444', fontSize: 9, fontFamily: 'JetBrains Mono' },
    labelBgStyle: { fill: '#0F172A', fillOpacity: 0.8 },
  },
  {
    id: 'e-qm-hub-qm-pay',
    source: 'qm-hub',
    target: 'qm-payments',
    animated: true,
    style: { stroke: '#F59E0B', strokeWidth: 1.5 },
  },
]

export const summaryStats = {
  applications: 5,
  queueManagers: 4,
  queues: 20,
  channels: 79,
  riskHotspots: 3,
  multiQMApps: 2,
}

export const intelligenceHighlights = [
  { id: 1, message: '18 policy violations detected across 4 QMs', severity: 'critical' as const, count: 18 },
  { id: 2, message: '7 topology cycles found in routing paths', severity: 'critical' as const, count: 7 },
  { id: 3, message: '13 redundant channels identified', severity: 'warning' as const, count: 13 },
  { id: 4, message: '5 high-risk queue managers flagged', severity: 'critical' as const, count: 5 },
  { id: 5, message: '11 orphan objects surfaced', severity: 'warning' as const, count: 11 },
  { id: 6, message: '4 routing hotspots exceed safe fan-out', severity: 'warning' as const, count: 4 },
]
