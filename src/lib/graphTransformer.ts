import type { Node, Edge } from '@xyflow/react'
import type { TopologyNodeData, QueueNodeData, AppNodeData } from '../data/topologyData'

export interface GraphNode {
  id: string | number
  label: string
  title?: string
  group?: string
  color?: {
    background: string
    border: string
    highlight: { background: string; border: string }
    hover: { background: string; border: string }
  }
  font?: { color: string; size: number; face: string }
  shape?: string
  size?: number
  borderWidth?: number
  borderWidthSelected?: number
  shadow?: boolean
  nodeType?: string
  risk?: string
  subtype?: string
  region?: string
  role?: string
  connections?: number
  issues?: string[]
}

export interface GraphEdge {
  id: string
  from: string | number
  to: string | number
  label?: string
  color?: { color: string; highlight: string; hover: string; opacity?: number }
  width?: number
  dashes?: boolean | number[]
  arrows?: { to: { enabled: boolean; scaleFactor: number } }
  smooth?: { enabled: boolean; type: string; roundness: number }
  edgeType?: string
}

export interface GraphFilters {
  search: string
  nodeType: 'all' | 'app' | 'queueManager' | 'queue'
  queueSubtype: 'all' | 'local' | 'remote' | 'xmitq'
  risk: 'all' | 'high' | 'medium' | 'low'
  showViolationsOnly: boolean
  showOrphansOnly: boolean
  edgeType: 'all' | 'active' | 'idle' | 'risky'
  region: string
  role: 'all' | 'Producer' | 'Consumer' | 'Mixed'
}

export const DEFAULT_GRAPH_FILTERS: GraphFilters = {
  search: '',
  nodeType: 'all',
  queueSubtype: 'all',
  risk: 'all',
  showViolationsOnly: false,
  showOrphansOnly: false,
  edgeType: 'all',
  region: 'all',
  role: 'all',
}

const NODE_COLORS = {
  app: {
    background: '#1E3A5F',
    border: '#3B82F6',
    highlight: { background: '#1E40AF', border: '#60A5FA' },
    hover: { background: '#1E3A5F', border: '#60A5FA' },
  },
  queueManager: {
    background: '#0E3A40',
    border: '#06B6D4',
    highlight: { background: '#164E63', border: '#22D3EE' },
    hover: { background: '#0E3A40', border: '#22D3EE' },
  },
  queue_local: {
    background: '#0D3B37',
    border: '#14B8A6',
    highlight: { background: '#134E4A', border: '#2DD4BF' },
    hover: { background: '#0D3B37', border: '#2DD4BF' },
  },
  queue_remote: {
    background: '#1E1B4B',
    border: '#6366F1',
    highlight: { background: '#312E81', border: '#818CF8' },
    hover: { background: '#1E1B4B', border: '#818CF8' },
  },
  queue_xmitq: {
    background: '#3B2200',
    border: '#F59E0B',
    highlight: { background: '#451A03', border: '#FCD34D' },
    hover: { background: '#3B2200', border: '#FCD34D' },
  },
}

const RISK_BORDER = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
  none: '#14B8A6',
}

const ORPHAN_IDS = new Set(['q-orphan'])
const VIOLATION_IDS = new Set(['qm-payments', 'qm-hub', 'app-payments', 'q-orders-in', 'q-xmit-hub-pay'])

function buildNodeTitle(node: Node<TopologyNodeData>): string {
  const d = node.data as Record<string, unknown>
  const lines: string[] = [`<b>${String(d.label ?? node.id)}</b>`, `Type: ${node.type}`]

  if (d.risk) lines.push(`Risk: ${String(d.risk).toUpperCase()}`)
  if (d.region) lines.push(`Region: ${String(d.region)}`)
  if (d.role) lines.push(`Role: ${String(d.role)}`)
  if (d.connections !== undefined) lines.push(`Connections: ${d.connections}`)
  if (d.subtype) lines.push(`Subtype: ${String(d.subtype)}`)
  if (d.owner) lines.push(`Owner: ${String(d.owner)}`)
  if (d.depth !== undefined) lines.push(`Depth: ${d.depth} / ${d.maxDepth ?? 'n/a'}`)
  if (d.queues !== undefined) lines.push(`Queues: ${d.queues}`)
  if (d.channels !== undefined) lines.push(`Channels: ${d.channels}`)
  if (d.apps !== undefined) lines.push(`Apps: ${d.apps}`)
  if (d.description) lines.push(`<i>${String(d.description)}</i>`)
  if (Array.isArray(d.issues) && d.issues.length > 0) {
    lines.push(`Issues: ${(d.issues as string[]).join(', ')}`)
  }

  return lines.join('<br>')
}

export function transformNodesToGraph(
  nodes: Node<TopologyNodeData>[],
  filters: GraphFilters
): GraphNode[] {
  return nodes
    .filter((node) => {
      const d = node.data as Record<string, unknown>
      const label = String(d.label ?? node.id)

      if (filters.search) {
        if (!label.toLowerCase().includes(filters.search.toLowerCase())) return false
      }

      if (filters.nodeType !== 'all' && node.type !== filters.nodeType) return false

      if (filters.queueSubtype !== 'all') {
        if (node.type !== 'queue') return false
        if ((d.subtype as string) !== filters.queueSubtype) return false
      }

      if (filters.risk !== 'all') {
        const r = d.risk as string
        const matchLow = filters.risk === 'low' && (r === 'none' || r === 'low')
        if (r !== filters.risk && !matchLow) return false
      }

      if (filters.showViolationsOnly && !VIOLATION_IDS.has(node.id)) return false
      if (filters.showOrphansOnly && !ORPHAN_IDS.has(node.id)) return false

      if (filters.region !== 'all' && d.region !== filters.region) return false

      if (filters.role !== 'all' && node.type === 'app') {
        if ((d as AppNodeData).role !== filters.role) return false
      }

      return true
    })
    .map((node) => {
      const d = node.data as Record<string, unknown>
      const label = String(d.label ?? node.id)
      const risk = (d.risk as string) ?? 'none'
      const nodeType = node.type ?? 'queue'

      let colorBase = NODE_COLORS.app
      let shape = 'box'
      let nodeSize = 20

      if (nodeType === 'app') {
        colorBase = NODE_COLORS.app
        shape = 'box'
        nodeSize = 22
      } else if (nodeType === 'queueManager') {
        colorBase = NODE_COLORS.queueManager
        shape = 'database'
        nodeSize = 28
      } else if (nodeType === 'queue') {
        const sub = (d as QueueNodeData).subtype
        if (sub === 'remote') {
          colorBase = NODE_COLORS.queue_remote
        } else if (sub === 'xmitq') {
          colorBase = NODE_COLORS.queue_xmitq
        } else {
          colorBase = NODE_COLORS.queue_local
        }
        shape = 'ellipse'
        nodeSize = 18
      }

      const riskBorder = RISK_BORDER[risk as keyof typeof RISK_BORDER] ?? colorBase.border
      const isHighRisk = risk === 'high'

      return {
        id: node.id,
        label,
        title: buildNodeTitle(node),
        group: nodeType,
        color: {
          ...colorBase,
          border: isHighRisk ? riskBorder : colorBase.border,
          highlight: {
            ...colorBase.highlight,
            border: isHighRisk ? riskBorder : colorBase.highlight.border,
          },
        },
        font: { color: '#E2E8F0', size: 11, face: 'JetBrains Mono, monospace' },
        shape,
        size: nodeSize,
        borderWidth: isHighRisk ? 2 : 1,
        borderWidthSelected: 3,
        shadow: isHighRisk,
        nodeType,
        risk,
        subtype: String(d.subtype ?? ''),
        region: String(d.region ?? ''),
        role: String((d as AppNodeData).role ?? ''),
        connections: (d as AppNodeData).connections ?? 0,
        issues: Array.isArray(d.issues) ? (d.issues as string[]) : [],
      } as GraphNode
    })
}

export function transformEdgesToGraph(
  edges: Edge[],
  visibleNodeIds: Set<string>,
  filters: GraphFilters
): GraphEdge[] {
  return edges
    .filter((edge) => {
      if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) return false

      const strokeColor = (edge.style?.stroke as string) ?? '#334155'
      const isDashed = !!(edge.style?.strokeDasharray)

      if (filters.edgeType === 'risky') {
        return strokeColor === '#EF4444'
      }
      if (filters.edgeType === 'idle') {
        return isDashed
      }
      if (filters.edgeType === 'active') {
        return !isDashed && edge.animated === true
      }

      return true
    })
    .map((edge) => {
      const strokeColor = (edge.style?.stroke as string) ?? '#334155'
      const strokeWidth = (edge.style?.strokeWidth as number) ?? 1.5
      const isDashed = !!(edge.style?.strokeDasharray)

      return {
        id: edge.id,
        from: edge.source,
        to: edge.target,
        label: edge.label as string | undefined,
        color: {
          color: strokeColor,
          highlight: '#FFFFFF',
          hover: '#94A3B8',
          opacity: 1,
        },
        width: strokeWidth,
        dashes: isDashed,
        arrows: { to: { enabled: true, scaleFactor: 0.6 } },
        smooth: { enabled: true, type: 'dynamic', roundness: 0.5 },
        edgeType: isDashed ? 'idle' : strokeColor === '#EF4444' ? 'risky' : 'active',
      } as GraphEdge
    })
}

export function getAvailableRegions(nodes: Node<TopologyNodeData>[]): string[] {
  const regions = new Set<string>()
  nodes.forEach((n) => {
    const region = (n.data as Record<string, unknown>).region as string | undefined
    if (region) regions.add(region)
  })
  return Array.from(regions).sort()
}
