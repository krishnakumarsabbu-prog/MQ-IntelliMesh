import PageContainer from '../components/ui/PageContainer'
import CopilotHero from '../components/explainability/CopilotHero'
import CopilotChatPanel from '../components/explainability/CopilotChatPanel'
import DecisionExplorer from '../components/explainability/DecisionExplorer'
import WhyThisMattersPanel from '../components/explainability/WhyThisMattersPanel'
import SimulationPanel from '../components/explainability/SimulationPanel'
import ReviewQueue from '../components/explainability/ReviewQueue'

export default function Explainability() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <CopilotHero />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          <div className="xl:col-span-3">
            <CopilotChatPanel />
          </div>
          <div className="xl:col-span-2">
            <DecisionExplorer />
          </div>
        </div>

        <WhyThisMattersPanel />

        <SimulationPanel />

        <ReviewQueue />
      </div>
    </PageContainer>
  )
}
