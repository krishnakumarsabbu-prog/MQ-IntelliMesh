import { get } from './client'
import type { AnalyzeResponse } from '../../types/api'

export async function runAnalysis(
  datasetId?: string,
  signal?: AbortSignal,
): Promise<AnalyzeResponse> {
  const path = datasetId
    ? `/api/analyze?dataset_id=${encodeURIComponent(datasetId)}`
    : '/api/analyze'
  return get<AnalyzeResponse>(path, signal)
}
