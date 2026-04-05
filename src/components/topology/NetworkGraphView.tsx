import { useRef, useEffect, useState, useCallback } from 'react'
import VisNetworkGraph from 'react-vis-network-graph'
import { ZoomIn, ZoomOut, Maximize2, Download, RefreshCw } from 'lucide-react'
import type { GraphNode, GraphEdge, GraphFilters } from '../../lib/graphTransformer'


interface NetworkGraphViewProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  filters: GraphFilters
  onNodeSelect?: (nodeId: string | null) => void
  selectedNodeId?: string | null
}

const GRAPH_OPTIONS = {
  autoResize: true,
  height: '100%',
  width: '100%',
  locale: 'en',
  clickToUse: false,
  physics: {
    enabled: true,
    stabilization: {
      enabled: true,
      iterations: 200,
      updateInterval: 25,
      fit: true,
    },
    barnesHut: {
      gravitationalConstant: -8000,
      centralGravity: 0.3,
      springLength: 120,
      springConstant: 0.04,
      damping: 0.09,
      avoidOverlap: 0.3,
    },
  },
  interaction: {
    hover: true,
    tooltipDelay: 200,
    hideEdgesOnDrag: false,
    multiselect: false,
    navigationButtons: false,
    keyboard: {
      enabled: true,
      bindToWindow: false,
    },
    zoomView: true,
    dragView: true,
  },
  nodes: {
    borderWidth: 1,
    borderWidthSelected: 3,
    chosen: true,
    shadow: { enabled: false },
    font: {
      color: '#E2E8F0',
      size: 11,
      face: 'JetBrains Mono, monospace',
      vadjust: 0,
    },
    margin: { top: 6, right: 10, bottom: 6, left: 10 },
  },
  edges: {
    smooth: { enabled: true, type: 'dynamic', roundness: 0.4, forceDirection: 'none' },
    color: { inherit: false },
    selectionWidth: 2.5,
    hoverWidth: 1.5,
  },
  layout: {
    randomSeed: 42,
    improvedLayout: true,
  },
}

export default function NetworkGraphView({
  nodes,
  edges,
  onNodeSelect,
  selectedNodeId,
}: NetworkGraphViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const networkRef = useRef<any>(null)
  const [isStabilizing, setIsStabilizing] = useState(true)
  const [nodeCount, setNodeCount] = useState(nodes.length)
  const [edgeCount, setEdgeCount] = useState(edges.length)

  useEffect(() => {
    setNodeCount(nodes.length)
    setEdgeCount(edges.length)
    setIsStabilizing(true)
  }, [nodes.length, edges.length])

  const events = {
    selectNode: (...args: unknown[]) => {
      const params = args[0] as { nodes: (string | number)[] }
      if (params?.nodes?.length > 0 && onNodeSelect) {
        onNodeSelect(String(params.nodes[0]))
      }
    },
    deselectNode: () => {
      if (onNodeSelect) onNodeSelect(null)
    },
    stabilizationIterationsDone: () => {
      setIsStabilizing(false)
    },
    stabilized: () => {
      setIsStabilizing(false)
    },
  }

  const handleFitView = useCallback(() => {
    if (networkRef.current?.Network) {
      networkRef.current.Network.fit()
    }
  }, [])

  const handleZoomIn = useCallback(() => {
    if (networkRef.current?.Network) {
      const net = networkRef.current.Network
      const scale = net.getScale()
      net.moveTo({ scale: scale * 1.3 })
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (networkRef.current?.Network) {
      const net = networkRef.current.Network
      const scale = net.getScale()
      net.moveTo({ scale: scale * 0.77 })
    }
  }, [])

  const handleReset = useCallback(() => {
    if (networkRef.current?.Network) {
      networkRef.current.Network.fit()
    }
  }, [])

  const handleExport = useCallback(() => {
    const canvas = document.querySelector('#network-graph-container canvas') as HTMLCanvasElement
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'topology-graph.png'
    a.click()
  }, [])

  const graphData = {
    nodes: nodes.map((n) => ({
      ...n,
      ...(selectedNodeId && n.id !== selectedNodeId
        ? {
            opacity: 0.25,
            color: {
              ...n.color,
              border: n.color?.border ?? '#334155',
            },
          }
        : {}),
    })),
    edges: edges.map((e) => ({
      ...e,
      ...(selectedNodeId &&
      String(e.from) !== selectedNodeId &&
      String(e.to) !== selectedNodeId
        ? { color: { ...e.color, opacity: 0.08 } }
        : {}),
    })),
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-[#0B1020]">
      <div
        id="network-graph-container"
        className="flex-1 relative"
        style={{ minHeight: 0 }}
      >
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-600 text-sm mb-1">No nodes match the current filters</div>
              <div className="text-slate-700 text-xs">Try relaxing your filter criteria</div>
            </div>
          </div>
        ) : (
          <VisNetworkGraph
            ref={networkRef}
            graph={graphData}
            options={GRAPH_OPTIONS}
            events={events}
            style={{ height: '100%', width: '100%' }}
          />
        )}

        {isStabilizing && nodes.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 backdrop-blur-sm">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-slate-400">Calculating layout…</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all backdrop-blur-sm"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all backdrop-blur-sm"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleFitView}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all backdrop-blur-sm"
          title="Fit view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all backdrop-blur-sm"
          title="Reset layout"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleExport}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all backdrop-blur-sm"
          title="Export as PNG"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/60 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/80 border border-blue-400/60" />
            <span className="text-[10px] text-slate-500">Application</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-cyan-500/80 border border-cyan-400/60" />
            <span className="text-[10px] text-slate-500">Queue Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500/80 border border-teal-400/60" />
            <span className="text-[10px] text-slate-500">Local Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500/80 border border-violet-400/60" />
            <span className="text-[10px] text-slate-500">Remote Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-400/60" />
            <span className="text-[10px] text-slate-500">XMIT Queue</span>
          </div>
          <div className="ml-2 pl-2 border-l border-slate-700/60 text-[10px] text-slate-600 font-mono">
            {nodeCount}n · {edgeCount}e
          </div>
        </div>
      </div>
    </div>
  )
}
