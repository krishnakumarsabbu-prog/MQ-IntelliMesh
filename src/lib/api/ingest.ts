import { get, postFormData } from './client'
import type { IngestResponse } from '../../types/api'

export async function uploadTopologyFiles(
  files: File[],
  signal?: AbortSignal,
): Promise<IngestResponse> {
  if (files.length === 0) {
    throw new Error('No files provided for ingestion.')
  }
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file, file.name)
  }
  return postFormData<IngestResponse>('/api/ingest', formData, signal)
}

export interface DatasetListResponse {
  dataset_ids: string[]
  count: number
}

export async function listDatasets(signal?: AbortSignal): Promise<DatasetListResponse> {
  return get<DatasetListResponse>('/api/ingest/datasets', signal)
}

export async function getDatasetSummary(
  datasetId: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  return get<Record<string, unknown>>(`/api/ingest/datasets/${datasetId}`, signal)
}
