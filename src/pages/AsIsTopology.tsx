import { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'
import { Network, Server, Layers, ArrowLeftRight, ShieldAlert, AppWindow, CheckCircle2, BrainCircuit } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import { useIngest } from '../context/IngestContext'
import AnalysisTriggerPanel from '../components/analysis/AnalysisTriggerPanel'

import {
  initialNodes,
  initialEdges,
  summaryStats,
  intelligenceHighlights,
  type QueueNodeData,
  type TopologyFiltersState,
} from '../data/topologyData'

import AppNode from '../components/topology/AppNode'
import QueueManagerNode from '../components/topology/QueueManagerNode'
import QueueNode from '../components/topology/QueueNode'
import NodeInspectionDrawer from '../components/topology/NodeInspectionDrawer'
import IntelligencePanel from '../components/topology/IntelligencePanel'
import TopologyLegend from '../components/topology/TopologyLegend'
import TopologyFilterBar, { type TopologyFilters } from '../components/topology/TopologyFilterBar'
import MetricCard from '../components/ui/MetricCard'
import NetworkGraphView from '../components/topology/NetworkGraphView'
import GraphFilterPanel from '../components/topology/GraphFilterPanel'
import {
  transformNodesToGraph,
  transformEdgesToGraph,
  getAvailableRegions,
  DEFAULT_GRAPH_FILTERS,
  type GraphFilters,
} from '../lib/graphTransformer'

const nodeTypes = {
  app: AppNode,
  queueManager: QueueManagerNode,
  queue: QueueNode,
}

const DEFAULT_FILTERS: TopologyFilters = {
  search: '',
  nodeType: 'all',
  queueSubtype: 'all',
  risk: 'all',
  showViolationsOnly: false,
  showOrphansOnly: false,
}

const ORPHAN_IDS = new Set(['q-orphan'])
const VIOLATION_IDS = new Set(['qm-payments', 'qm-hub', 'app-payments', 'q-orders-in', 'q-xmit-hub-pay'])

type RFNode = Node<Record<string, unknown>>

function filterNodes(nodes: RFNode[], filters: TopologyFilters): RFNode[] {
  return nodes.filter((node) => {
    const d = node.data as TopologyFiltersState

    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!String(d.label ?? '').toLowerCase().includes(q)) return false
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

    return true
  })
}

function getConnectedNodeIds(nodeId: string): string[] {
  return initialEdges
    .filter((e) => e.source === nodeId || e.target === nodeId)
    .map((e) => (e.source === nodeId ? e.target : e.source))
}

function TopologyCanvas() {
  const reactFlowInstance = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as RFNode[])
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<RFNode | null>(null)
  const [filters, setFilters] = useState<TopologyFilters>(DEFAULT_FILTERS)

  const filteredNodes = useMemo(() => filterNodes(nodes, filters), [nodes, filters])
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])
  const filteredEdges = useMemo(
    () => edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [edges, filteredNodeIds]
  )

  const connectedNodeIds = useMemo(
    () => (selectedNode ? getConnectedNodeIds(selectedNode.id) : []),
    [selectedNode]
  )

  const styledNodes = useMemo(() => {
    if (!selectedNode) return filteredNodes
    const connected = new Set(connectedNodeIds)
    connected.add(selectedNode.id)
    return filteredNodes.map((n) => ({
      ...n,
      style: { opacity: connected.has(n.id) ? 1 : 0.18 },
    }))
  }, [filteredNodes, selectedNode, connectedNodeIds])

  const styledEdges = useMemo(() => {
    if (!selectedNode) return filteredEdges
    return filteredEdges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: e.source === selectedNode.id || e.target === selectedNode.id ? 1 : 0.05,
        strokeWidth:
          e.source === selectedNode.id || e.target === selectedNode.id
            ? ((e.style?.strokeWidth as number) || 1.5) + 1
            : e.style?.strokeWidth,
      },
    }))
  }, [filteredEdges, selectedNode])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const rfNode = node as RFNode
      setSelectedNode((prev) => (prev?.id === rfNode.id ? null : rfNode))
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === rfNode.id })))
    },
    [setNodes]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false, style: {} })))
  }, [setNodes])

  const onFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.1, duration: 500 })
  }, [reactFlowInstance])

  const onCenter = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 500 })
  }, [reactFlowInstance])

  const onReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedNode(null)
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false, style: {} })))
  }, [setNodes])

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <TopologyFilterBar
        filters={filters}
        onChange={setFilters}
        onFitView={onFitView}
        onCenter={onCenter}
        onReset={onReset}
      />

      <div className="relative flex-1">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.2}
          maxZoom={2.5}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#0B1020' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1E293B"
          />
          <Controls showFitView showZoom showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'app') return '#3B82F6'
              if (n.type === 'queueManager') return '#06B6D4'
              if (n.type === 'queue') {
                const d = n.data as QueueNodeData
                if (d.subtype === 'remote') return '#8B5CF6'
                if (d.subtype === 'xmitq') return '#F59E0B'
                return '#14B8A6'
              }
              return '#475569'
            }}
            maskColor="rgba(11,16,32,0.8)"
            style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, width: 140, height: 90 }}
          />
        </ReactFlow>

        <div className="absolute bottom-4 left-4 z-10">
          <TopologyLegend />
        </div>

        {selectedNode && (
          <NodeInspectionDrawer
            node={selectedNode}
            onClose={() => {
              setSelectedNode(null)
              setNodes((nds) => nds.map((n) => ({ ...n, selected: false, style: {} })))
            }}
            connectedNodeIds={connectedNodeIds}
          />
        )}
      </div>
    </div>
  )
}

const metricCards = [
  {
    label: 'Applications',
    value: summaryStats.applications,
    delta: '+1 new',
    deltaType: 'up' as const,
    hint: '2 multi-QM apps',
    icon: AppWindow,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    label: 'Queue Managers',
    value: summaryStats.queueManagers,
    delta: 'stable',
    deltaType: 'neutral' as const,
    hint: '2 hub-class QMs',
    icon: Server,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
  {
    label: 'Queues',
    value: summaryStats.queues,
    delta: '+3',
    deltaType: 'up' as const,
    hint: '1 orphaned object',
    icon: Layers,
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
  },
  {
    label: 'Channels',
    value: summaryStats.channels,
    delta: '+18',
    deltaType: 'up' as const,
    hint: '13 redundant',
    icon: ArrowLeftRight,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
  },
  {
    label: 'Risk Hotspots',
    value: summaryStats.riskHotspots,
    delta: '+1',
    deltaType: 'up' as const,
    hint: 'critical severity',
    icon: ShieldAlert,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
  },
  {
    label: 'Multi-QM Apps',
    value: summaryStats.multiQMApps,
    delta: 'stable',
    deltaType: 'neutral' as const,
    hint: 'tight coupling risk',
    icon: Network,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
]

export default function AsIsTopology() {
  const { isAnalyzed, result, healthScore, criticalCount, highCount, totalFindings } = useAnalysis()
  const { isReady: ingestReady } = useIngest()
  const [graphFilters, setGraphFilters] = useState<GraphFilters>(DEFAULT_GRAPH_FILTERS)
  const [graphSelectedNodeId, setGraphSelectedNodeId] = useState<string | null>(null)

  const availableRegions = useMemo(() => getAvailableRegions(initialNodes), [])
  const graphNodes = useMemo(
    () => transformNodesToGraph(initialNodes, graphFilters),
    [graphFilters]
  )
  const graphVisibleIds = useMemo(() => new Set(graphNodes.map((n) => String(n.id))), [graphNodes])
  const graphEdges = useMemo(
    () => transformEdgesToGraph(initialEdges, graphVisibleIds, graphFilters),
    [graphVisibleIds, graphFilters]
  )

  const handleGraphFilterReset = useCallback(() => {
    setGraphFilters(DEFAULT_GRAPH_FILTERS)
    setGraphSelectedNodeId(null)
  }, [])

  const healthDisplayScore = isAnalyzed ? healthScore : 74
  const healthColor = healthDisplayScore >= 70 ? 'text-emerald-400' :
    healthDisplayScore >= 50 ? 'text-amber-400' : 'text-rose-400'
  const healthBarColor = healthDisplayScore >= 70 ? 'from-emerald-500 to-cyan-400' :
    healthDisplayScore >= 50 ? 'from-amber-500 to-emerald-400' : 'from-rose-500 to-amber-400'

  const liveHighlights = isAnalyzed && result
    ? [
        { id: 'h1', message: `${criticalCount} critical findings detected`, severity: 'critical' as const, count: criticalCount },
        { id: 'h2', message: `${highCount} high-severity issues`, severity: 'warning' as const, count: highCount },
        { id: 'h3', message: `${result.summary.policy_violations} policy violations`, severity: 'critical' as const, count: result.summary.policy_violations },
        { id: 'h4', message: `${result.summary.hotspots} risk hotspots`, severity: 'warning' as const, count: result.summary.hotspots },
        { id: 'h5', message: `${result.summary.simplification_opportunities} cleanup candidates`, severity: 'warning' as const, count: result.summary.simplification_opportunities },
      ].filter(h => h.count > 0)
    : intelligenceHighlights

  const liveStats = isAnalyzed && result
    ? [
        { label: 'Total findings', value: String(totalFindings), color: 'text-rose-400' },
        { label: 'Critical/High', value: String(criticalCount + highCount), color: 'text-rose-400' },
        { label: 'Policy violations', value: String(result.summary.policy_violations), color: 'text-amber-400' },
        { label: 'Risk hotspots', value: String(result.summary.hotspots), color: 'text-amber-400' },
        { label: 'Simplification ops', value: String(result.summary.simplification_opportunities), color: 'text-blue-400' },
      ]
    : [
        { label: 'Healthy nodes', value: '14', color: 'text-emerald-400' },
        { label: 'At-risk nodes', value: '7', color: 'text-amber-400' },
        { label: 'Critical nodes', value: '3', color: 'text-rose-400' },
        { label: 'Orphan objects', value: '1', color: 'text-slate-400' },
      ]

  const liveNodeDist = isAnalyzed && result
    ? [
        { label: 'Queue Managers', count: result.topology_stats.queue_managers, color: 'bg-cyan-500' },
        { label: 'Applications', count: result.topology_stats.applications, color: 'bg-blue-500' },
        { label: 'Queues', count: result.topology_stats.queues, color: 'bg-teal-500' },
        { label: 'Channels', count: result.topology_stats.channels, color: 'bg-amber-500' },
        { label: 'Relationships', count: result.topology_stats.relationships, color: 'bg-slate-500' },
      ]
    : [
        { label: 'Applications', count: 5, color: 'bg-blue-500' },
        { label: 'Queue Managers', count: 4, color: 'bg-cyan-500' },
        { label: 'Local Queues', count: 7, color: 'bg-teal-500' },
        { label: 'Remote Queues', count: 2, color: 'bg-violet-500' },
        { label: 'XMIT Queues', count: 2, color: 'bg-amber-500' },
      ]

  const totalNodes = liveNodeDist.reduce((s, d) => s + d.count, 0)

  const liveMetricCards = isAnalyzed && result
    ? [
        { label: 'Applications', value: result.topology_stats.applications, delta: undefined, deltaType: 'neutral' as const, hint: 'from analysis', icon: AppWindow, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
        { label: 'Queue Managers', value: result.topology_stats.queue_managers, delta: undefined, deltaType: 'neutral' as const, hint: 'from analysis', icon: Server, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/10' },
        { label: 'Queues', value: result.topology_stats.queues, delta: undefined, deltaType: 'neutral' as const, hint: 'total inventory', icon: Layers, iconColor: 'text-teal-400', iconBg: 'bg-teal-500/10' },
        { label: 'Channels', value: result.topology_stats.channels, delta: undefined, deltaType: 'neutral' as const, hint: 'from analysis', icon: ArrowLeftRight, iconColor: 'text-slate-400', iconBg: 'bg-slate-700/30' },
        { label: 'Risk Hotspots', value: result.summary.hotspots, delta: undefined, deltaType: 'neutral' as const, hint: 'detected by AI', icon: ShieldAlert, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10' },
        { label: 'Critical/High', value: criticalCount + highCount, delta: undefined, deltaType: 'neutral' as const, hint: 'need attention', icon: Network, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
      ]
    : metricCards

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden">
      <div className="flex-shrink-0 px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">As-Is Topology Explorer</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Explore the current MQ environment, relationships, structural risks, and policy violations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAnalyzed ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-400">Intelligence Active</span>
              </div>
            ) : ingestReady ? (
              <AnalysisTriggerPanel compact />
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {liveMetricCards.map((card, i) => (
            <MetricCard key={card.label} {...card} delay={i * 0.05} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-4 px-6 pb-5 min-h-0">
        <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0">

          {/* ReactFlow canvas */}
          <div className="flex-1 bg-[#0B1020] border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col shadow-2xl min-h-0" style={{ minHeight: '340px' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-[#0F172A]/90 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[12px] font-semibold text-slate-300">Live Topology Canvas</span>
                <span className="text-[10px] font-mono text-slate-600">· Click any node to inspect</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-600">
                  {initialNodes.length} nodes · {initialEdges.length} edges
                </span>
                {isAnalyzed ? (
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    Analysis Complete
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-700/40 border border-slate-700/40 text-slate-500">
                    Awaiting Analysis
                  </span>
                )}
              </div>
            </div>
            <ReactFlowProvider>
              <TopologyCanvas />
            </ReactFlowProvider>
          </div>

          {/* vis-network graph */}
          <div className="flex-1 bg-[#0B1020] border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col shadow-2xl min-h-0" style={{ minHeight: '340px' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-[#0F172A]/90 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[12px] font-semibold text-slate-300">Network Graph View</span>
                <span className="text-[10px] font-mono text-slate-600">· Physics-based layout · Click to select · Hover for details</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-600">
                  {graphNodes.length} nodes · {graphEdges.length} edges
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  vis-network
                </span>
              </div>
            </div>
            <GraphFilterPanel
              filters={graphFilters}
              onChange={setGraphFilters}
              onReset={handleGraphFilterReset}
              availableRegions={availableRegions}
            />
            <NetworkGraphView
              nodes={graphNodes}
              edges={graphEdges}
              filters={graphFilters}
              onNodeSelect={setGraphSelectedNodeId}
              selectedNodeId={graphSelectedNodeId}
            />
          </div>

        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto"
        >
          <IntelligencePanel highlights={liveHighlights} />

          <div className={`bg-[#0F172A] border rounded-xl p-4 ${isAnalyzed ? 'border-emerald-500/20' : 'border-slate-800/60'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {isAnalyzed ? 'Analysis Stats' : 'Quick Stats'}
              </span>
              {isAnalyzed && <BrainCircuit className="w-3 h-3 text-emerald-500/50" />}
            </div>
            <div className="space-y-2.5">
              {liveStats.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-slate-500">{s.label}</span>
                  <span className={`text-[13px] font-bold tabular-nums ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-600">Estate Health</span>
                <span className={`text-[11px] font-bold ${healthColor}`}>{healthDisplayScore}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${healthBarColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${healthDisplayScore}%` }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/60 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {isAnalyzed ? 'Inventory Breakdown' : 'Node Distribution'}
            </div>
            {liveNodeDist.map((d) => (
              <div key={d.label} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-slate-500">{d.label}</span>
                  <span className="text-[11px] font-mono text-slate-400">{d.count}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.color}`}
                    style={{ width: `${totalNodes > 0 ? (d.count / totalNodes) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
