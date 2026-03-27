import { useState } from 'react'
import PageContainer from '../components/ui/PageContainer'
import DeliveryHero from '../components/exports/DeliveryHero'
import ArtifactLibrary from '../components/exports/ArtifactLibrary'
import ArtifactPreviewPanel from '../components/exports/ArtifactPreviewPanel'
import ReadinessPanel from '../components/exports/ReadinessPanel'
import HandoffWorkflow from '../components/exports/HandoffWorkflow'
import ProvisioningTargets from '../components/exports/ProvisioningTargets'
import ExportNotesFooter from '../components/exports/ExportNotesFooter'

export default function Exports() {
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>('ART-001')

  return (
    <PageContainer>
      <div className="space-y-6">
        <DeliveryHero />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          <div className="xl:col-span-2">
            <ArtifactLibrary
              selectedId={selectedArtifact}
              onSelect={setSelectedArtifact}
            />
          </div>
          <div className="xl:col-span-3 space-y-6">
            <ArtifactPreviewPanel
              selectedId={selectedArtifact}
              onClose={() => setSelectedArtifact(null)}
            />
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
