import { post } from './client'
import type { TransformResponse } from '../../types/api'

export async function runTransformation(
  datasetId?: string,
  signal?: AbortSignal,
): Promise<TransformResponse> {
  return post<TransformResponse>('/api/transform', { dataset_id: datasetId ?? null }, signal)
}
