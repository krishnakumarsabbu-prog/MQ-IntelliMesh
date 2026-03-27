import PageContainer from '../components/ui/PageContainer'
import MTCSHero from '../components/complexitylab/MTCSHero'
import ComplexityBreakdownTable from '../components/complexitylab/ComplexityBreakdownTable'
import FormulaPanel from '../components/complexitylab/FormulaPanel'
import HotspotPanel from '../components/complexitylab/HotspotPanel'
import ImpactGrid from '../components/complexitylab/ImpactGrid'
import StructuralComparisonCharts from '../components/complexitylab/StructuralComparisonCharts'
import ExecutiveInterpretationPanel from '../components/complexitylab/ExecutiveInterpretationPanel'
import DeterminismFooter from '../components/complexitylab/DeterminismFooter'
import {
  mtcsScores,
  dimensions,
  formulaWeights,
  hotspots,
  impactMetrics,
  radarData,
  barData,
  executiveInsights,
  assumptionItems,
} from '../data/complexityData'

export default function ComplexityLab() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <MTCSHero scores={mtcsScores} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ComplexityBreakdownTable dimensions={dimensions} />
          </div>
          <div>
            <FormulaPanel weights={formulaWeights} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <HotspotPanel items={hotspots} />
          <ImpactGrid metrics={impactMetrics} />
        </div>

        <StructuralComparisonCharts radar={radarData} bars={barData} />

        <ExecutiveInterpretationPanel insights={executiveInsights} />

        <DeterminismFooter assumptions={assumptionItems} />
      </div>
    </PageContainer>
  )
}
