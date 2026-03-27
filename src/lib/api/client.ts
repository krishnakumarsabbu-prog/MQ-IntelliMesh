import { env } from '../../config/env'
import type { ApiError } from '../../types/api'

export class ApiRequestError extends Error {
  readonly status: number | undefined
  readonly details: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.details = details
  }

  toApiError(): ApiError {
    return {
      message: this.message,
      status: this.status,
      details: this.details,
    }
  }
}

function buildUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${env.apiBaseUrl}${normalized}`
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const body = await response.json()
      detail = body?.detail ?? body?.message ?? detail
    } catch {
      // ignore parse failures on error bodies
    }
    throw new ApiRequestError(detail, response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiRequestError('Backend returned an invalid JSON response.', response.status)
  }
}

export async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method: 'GET',
      headers: buildHeaders(),
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiRequestError(
      'Backend unavailable. Please ensure the MQ IntelliMesh API is running.',
      undefined,
      err,
    )
  }
  return parseResponse<T>(response)
}

export async function post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiRequestError(
      'Backend unavailable. Please ensure the MQ IntelliMesh API is running.',
      undefined,
      err,
    )
  }
  return parseResponse<T>(response)
}

export async function postFormData<T>(path: string, formData: FormData, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiRequestError(
      'Failed to upload topology dataset. Please check your connection and try again.',
      undefined,
      err,
    )
  }
  return parseResponse<T>(response)
}

export function getDownloadUrl(path: string): string {
  return buildUrl(path)
}

const apiClient = { get, post, postFormData, getDownloadUrl }
export default apiClient
