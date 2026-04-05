declare module 'react-vis-network-graph' {
  import { Component, CSSProperties } from 'react'

  export interface GraphData {
    nodes: Record<string, unknown>[]
    edges: Record<string, unknown>[]
  }

  export interface NetworkRef {
    Network: {
      fit: () => void
      getScale: () => number
      moveTo: (options: Record<string, unknown>) => void
      zoomIn: (scaleFactor: number) => void
      zoomOut: (scaleFactor: number) => void
      selectNodes: (ids: (string | number)[]) => void
      unselectAll: () => void
    }
  }

  export type GraphEvents = Record<string, ((...args: unknown[]) => void) | undefined>

  interface VisNetworkGraphProps {
    graph: GraphData
    options?: Record<string, unknown>
    events?: GraphEvents
    style?: CSSProperties
  }

  export default class VisNetworkGraph extends Component<VisNetworkGraphProps> {}
}
