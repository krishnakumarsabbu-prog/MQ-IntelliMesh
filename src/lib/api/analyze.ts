import { post } from './client'
import type { AnalyzeResponse } from '../../types/api'

export async function runAnalysis(
  datasetId?: string,
  signal?: AbortSignal,
): Promise<AnalyzeResponse> {
  return post<AnalyzeResponse>('/api/analyze', { dataset_id: datasetId ?? null }, signal)
}
