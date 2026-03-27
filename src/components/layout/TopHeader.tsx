import { useLocation } from 'react-router-dom'
import { Search, Bell, HelpCircle, Cpu, ChevronDown } from 'lucide-react'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Platform Overview & AI Intelligence' },
  '/topology': { title: 'As-Is Topology', subtitle: 'Current MQ Estate Discovery' },
  '/findings': { title: 'Findings', subtitle: 'Anomalies, Risks & Policy Violations' },
  '/planner': { title: 'Transformation Planner', subtitle: 'Guided Topology Simplification' },
  '/target-state': { title: 'Target State', subtitle: 'Optimized Architecture Design' },
  '/complexity-lab': { title: 'Complexity Lab', subtitle: 'Metrics, Scoring & Analysis' },
  '/explainability': { title: 'Explainability', subtitle: 'AI Decision Transparency' },
  '/exports': { title: 'Exports', subtitle: 'Automation-Ready Artifacts' },
}

export default function TopHeader() {
  const location = useLocation()
  const page = pageTitles[location.pathname] || { title: 'MQ IntelliMesh', subtitle: '' }

  return (
    <header className="h-14 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/60 flex items-center px-6 gap-4 sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-3">
        <div>
          <h1 className="text-[15px] font-semibold text-white leading-tight">{page.title}</h1>
          <p className="text-[11px] text-slate-500 leading-none mt-0.5">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search topology, objects, channels..."
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-[12px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mr-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-400">Demo Environment</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 mr-2">
          <Cpu className="w-3 h-3 text-violet-400" />
          <span className="text-[11px] font-medium text-violet-300">AI Active</span>
        </div>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-800 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white">
            PB
          </div>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>
      </div>
    </header>
  )
}
