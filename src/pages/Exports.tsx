import PageContainer from '../components/ui/PageContainer'
import DeliveryHero from '../components/exports/DeliveryHero'
import ExportTriggerPanel from '../components/exports/ExportTriggerPanel'
import ExportResultsPanel from '../components/exports/ExportResultsPanel'
import HandoffWorkflow from '../components/exports/HandoffWorkflow'
import ProvisioningTargets from '../components/exports/ProvisioningTargets'
import ExportNotesFooter from '../components/exports/ExportNotesFooter'
import ReadinessPanel from '../components/exports/ReadinessPanel'

export default function Exports() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <DeliveryHero />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          <div className="xl:col-span-2">
            <ExportTriggerPanel />
          </div>
          <div className="xl:col-span-3 space-y-6">
            <ExportResultsPanel />
            <ReadinessPanel />
          </div>
        </div>

        <HandoffWorkflow />

        <ProvisioningTargets />

        <ExportNotesFooter />
      </div>
    </PageContainer>
  )
}
