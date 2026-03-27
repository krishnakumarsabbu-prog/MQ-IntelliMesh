export interface ApiError {
  message: string
  status?: number
  details?: unknown
}

export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

export interface HealthResponse {
  status: string
  version?: string
  environment?: string
  uptime_seconds?: number
  message?: string
}

export interface IngestFileResult {
  filename: string
  dataset_type: string
  rows: number
  warnings: string[]
}

export interface IngestResponse {
  status: string
  message: string
  dataset_id: string
  files_processed: IngestFileResult[]
  warnings: string[]
  errors: string[]
  queue_managers: number
  queues: number
  applications: number
  channels: number
  relationships: number
}

export interface Finding {
  finding_id: string
  type: string
  category: string
  severity: string
  subject_type: string
  subject_id: string
  title: string
  description: string
  recommendation: string
  confidence: number
}

export interface AnalyzeResponse {
  status: string
  message: string
  dataset_id: string
  health_score: number
  findings: Finding[]
  findings_count: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  info_count: number
  summary: Record<string, unknown>
}

export interface TransformDecision {
  id: string
  decision_type: string
  subject_type: string
  subject_id: string
  title: string
  reason: string
  impact: string
  confidence: number
}

export interface ComplexityScore {
  total_score: number
  grade: string
  dimensions: Array<{ name: string; label: string; value: number; weight: number; weighted: number }>
}

export interface TransformComplexity {
  before: ComplexityScore
  after: ComplexityScore
  delta_score: number
  reduction_percent: number
}

export interface TransformValidation {
  compliance_score: number
  passed_checks: Array<{ check_id: string; name: string; detail: string }>
  failed_checks: Array<{ check_id: string; name: string; detail: string }>
  warnings: string[]
}

export interface TransformSummary {
  applications: number
  queue_managers_before: number
  queue_managers_after: number
  channels_before: number
  channels_after: number
  local_queues_generated: number
  remote_queues_generated: number
  xmit_queues_generated: number
  routes_generated: number
}

export interface TransformResponse {
  status: string
  message: string
  transformation_id: string
  dataset_id: string
  decisions: TransformDecision[]
  decisions_count: number
  summary: TransformSummary
  complexity: TransformComplexity
  validation: TransformValidation
  target_topology: Record<string, unknown>
}

export interface ExportArtifact {
  name: string
  type: string
  records: number
  path: string
  size_bytes: number
}

export interface ExportBundle {
  name: string
  path: string
  size_bytes: number
}

export interface ExportSummary {
  total_artifacts: number
  applications: number
  queue_managers_before: number
  queue_managers_after: number
  channels_before: number
  channels_after: number
  complexity_reduction_percent: number
  compliance_score: number
  findings_count: number
  decisions_count: number
  routes_generated: number
}

export interface ExportResponse {
  status: string
  message: string
  export_id: string
  generated_at: string
  dataset_id: string
  transformation_id: string
  artifact_count: number
  artifacts: ExportArtifact[]
  bundle: ExportBundle | null
  summary: ExportSummary
}

export interface ApiErrorResponse {
  detail: string
  status?: number
}
