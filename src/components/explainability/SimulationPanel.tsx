import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle2, AlertOctagon, PlusCircle, GitMerge, Trash2, MoveRight, Route, Layers } from 'lucide-react'
import { simulationScenarios } from '../../data/explainabilityData'
import type { SimulationScenario } from '../../data/explainabilityData'

const scenarioIcons: Record<string, React.ElementType> = {
  'plus-app': PlusCircle,
  merge: GitMerge,
  trash: Trash2,
  move: MoveRight,
  route: Route,
  layers: Layers,
}

const riskConfig = {
  low: { label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  medium: { label: 'Medium Risk', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
  high: { label: 'High Risk', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: AlertOctagon },
}

function EffectRow({ label, delta, unit, direction }: { label: string; delta: number; unit: string; direction: 'positive' | 'negative' | 'neutral' }) {
  const isPos = direction === 'positive'
  const isNeg = direction === 'negative'

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/30 last:border-0">
      <span className="text-[11px] text-slate-400">{label}</span>
      <div className={`flex items-center gap-1 text-[11px] font-bold font-mono ${isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-500'}`}>
        {isPos && delta !== 0 ? <TrendingDown className="w-3 h-3" /> : isNeg && delta !== 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        {delta > 0 ? '+' : ''}{delta}{unit ? ` ${unit}` : ''}
      </div>
    </div>
  )
}

function ScenarioCard({ scenario, isActive, onSelect }: { scenario: SimulationScenario; isActive: boolean; onSelect: () => void }) {
  const ScenIcon = scenarioIcons[scenario.icon] || FlaskConical
  const risk = riskConfig[scenario.risk]
  const RiskIcon = risk.icon

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
        isActive
          ? 'bg-blue-500/8 border-blue-500/30 ring-1 ring-blue-500/15'
          : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700/60'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isActive ? 'bg-blue-500/15 border border-blue-500/25' : 'bg-slate-800/60 border border-slate-700/40'}`}>
          <ScenIcon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[12px] font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{scenario.label}</span>
            <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${risk.bg} ${risk.border} ${risk.color}`}>
              <RiskIcon className="w-2.5 h-2.5" />
              {risk.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{scenario.description}</p>
        </div>
      </div>
    </motion.button>
  )
}

export default function SimulationPanel() {
  const [activeId, setActiveId] = useState<string>(simulationScenarios[0].id)
  const active = simulationScenarios.find(s => s.id === activeId) || simulationScenarios[0]
  const risk = riskConfig[active.risk]
  const RiskIcon = risk.icon

  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">What-If Simulation</h2>
          <p className="text-[11px] text-slate-500">Explore predicted impact of architectural changes before committing</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/8 border border-cyan-500/15">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400 font-semibold">Simulation Engine Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/40">
        <div className="lg:col-span-2 p-4 space-y-2">
          <div className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-3">Select Scenario</div>
          {simulationScenarios.map(s => (
            <ScenarioCard key={s.id} scenario={s} isActive={s.id === activeId} onSelect={() => setActiveId(s.id)} />
          ))}
        </div>

        <div className="lg:col-span-3 p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-[15px] font-bold text-white">{active.label}</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">{active.description}</p>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${risk.bg} ${risk.border} ${risk.color}`}>
                  <RiskIcon className="w-3 h-3" />
                  {risk.label}
                </span>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 mb-4">
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-3">Predicted Impact</div>
                <div className="divide-y divide-slate-800/30">
                  {active.effects.map(eff => (
                    <EffectRow key={eff.label} {...eff} />
                  ))}
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${active.risk === 'high' ? 'bg-rose-500/5 border-rose-500/20' : active.risk === 'medium' ? 'bg-amber-500/5 border-amber-500/15' : 'bg-emerald-500/5 border-emerald-500/15'}`}>
                <div className="flex items-start gap-2.5">
                  <RiskIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${risk.color}`} />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: risk.color.replace('text-', '') }}>
                      Copilot Recommendation
                    </div>
                    <p className="text-[12px] text-slate-300 leading-relaxed">{active.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                <span className="text-[10px] text-slate-700">Simulation is predictive — commit requires architect approval</span>
                <button className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all font-medium">
                  Add to Review Queue
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
