import { get } from './client'
import type { HealthResponse } from '../../types/api'

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return get<HealthResponse>('/health', signal)
}
