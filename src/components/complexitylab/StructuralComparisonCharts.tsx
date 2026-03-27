import { motion } from 'framer-motion'
import { BarChart2 } from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { radarData, barData } from '../../data/complexityData'

type RadarPoint = typeof radarData[number]
type BarPoint = typeof barData[number]

interface StructuralComparisonChartsProps {
  radar: RadarPoint[]
  bars: BarPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F172A] border border-slate-700/60 rounded-xl px-3 py-2.5 shadow-xl">
      <div className="text-[11px] font-semibold text-slate-300 mb-1.5">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-mono font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function StructuralComparisonCharts({ radar, bars }: StructuralComparisonChartsProps) {
  return (
    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Structural Comparison Visualizations</h2>
          <p className="text-[11px] text-slate-500">Radar coverage and per-dimension bar comparison across all 8 dimensions</p>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/70" />
            As-Is
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" />
            Target
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/40">
        <div className="p-5">
          <div className="text-[12px] font-semibold text-slate-400 mb-4">Complexity Radar — 8 Dimensions</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#1E293B" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Inter' }}
                />
                <Radar
                  name="As-Is"
                  dataKey="asIs"
                  stroke="#F87171"
                  fill="#EF4444"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#34D399"
                  fill="#10B981"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="p-5">
          <div className="text-[12px] font-semibold text-slate-400 mb-4">Per-Dimension Score Comparison</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 4, right: 8, bottom: 4, left: -16 }} barCategoryGap="25%">
                <CartesianGrid vertical={false} stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1E293B60' }} />
                <Legend
                  wrapperStyle={{ fontSize: 10, color: '#64748B', paddingTop: 8 }}
                  iconType="square"
                />
                <Bar dataKey="asIs" name="As-Is" fill="#EF4444" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#10B981" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
