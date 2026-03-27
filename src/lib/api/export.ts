import { post, get, getDownloadUrl } from './client'
import type { ExportResponse } from '../../types/api'

export async function generateExportBundle(
  datasetId?: string,
  transformationId?: string,
  signal?: AbortSignal,
): Promise<ExportResponse> {
  return post<ExportResponse>(
    '/api/export',
    {
      dataset_id: datasetId ?? null,
      transformation_id: transformationId ?? null,
    },
    signal,
  )
}

export async function getLatestExport(signal?: AbortSignal): Promise<ExportResponse> {
  return get<ExportResponse>('/api/export/latest', signal)
}

export function getExportDownloadUrl(exportId: string): string {
  return getDownloadUrl(`/api/export/download/${exportId}`)
}
