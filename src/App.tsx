import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import AsIsTopology from './pages/AsIsTopology'
import Findings from './pages/Findings'
import TransformationPlanner from './pages/TransformationPlanner'
import TargetState from './pages/TargetState'
import ComplexityLab from './pages/ComplexityLab'
import Explainability from './pages/Explainability'
import Exports from './pages/Exports'
import { IngestProvider } from './context/IngestContext'
import { AnalysisProvider } from './context/AnalysisContext'

export default function App() {
  return (
    <IngestProvider>
    <AnalysisProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="topology" element={<AsIsTopology />} />
            <Route path="findings" element={<Findings />} />
            <Route path="planner" element={<TransformationPlanner />} />
            <Route path="target-state" element={<TargetState />} />
            <Route path="complexity-lab" element={<ComplexityLab />} />
            <Route path="explainability" element={<Explainability />} />
            <Route path="exports" element={<Exports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AnalysisProvider>
    </IngestProvider>
  )
}
