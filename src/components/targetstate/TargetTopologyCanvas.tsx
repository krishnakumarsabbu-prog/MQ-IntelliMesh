import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { type QueueNodeData } from '../../data/topologyData'
import { targetNodes, targetEdges } from '../../data/targetStateData'
import AppNode from '../topology/AppNode'
import QueueManagerNode from '../topology/QueueManagerNode'
import QueueNode from '../topology/QueueNode'

const nodeTypes = {
  app: AppNode,
  queueManager: QueueManagerNode,
  queue: QueueNode,
}

function TargetCanvasInner() {
  const reactFlowInstance = useReactFlow()
  const [nodes, , onNodesChange] = useNodesState(targetNodes)
  const [edges, , onEdgesChange] = useEdgesState(targetEdges)

  const onFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.1, duration: 500 })
  }, [reactFlowInstance])

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.06 }}
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0B1020' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1E293B" />
        <Controls showFitView showZoom showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'app') return '#10B981'
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

      <button
        onClick={onFitView}
        className="absolute top-3 right-3 z-10 px-3 py-1.5 text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 rounded-lg transition-all backdrop-blur-sm"
      >
        Fit View
      </button>
    </div>
  )
}

export default function TargetTopologyCanvas() {
  return <TargetCanvasInner />
}
