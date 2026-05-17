import { apiFetch } from './api'
import type { HistoryEntry } from '@/types'

export interface HistoryResponse {
  entries: HistoryEntry[]
  total: number
}

export interface HistoryParams {
  search?: string
  device_id?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export async function getHistory(
  token: string,
  params: HistoryParams = {}
): Promise<HistoryResponse> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.device_id) query.set('device_id', params.device_id)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.offset) query.set('offset', String(params.offset))

  const qs = query.toString()
  return apiFetch<HistoryResponse>(`/v1/history${qs ? `?${qs}` : ''}`, { token })
}

export async function clearHistory(token: string): Promise<void> {
  return apiFetch<void>('/v1/history', { method: 'DELETE', token })
}
