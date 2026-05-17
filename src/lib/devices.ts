import { apiFetch } from './api'
import type { Device } from '@/types'

export interface DevicesResponse {
  devices: Device[]
}

export async function getDevices(token: string): Promise<Device[]> {
  const data = await apiFetch<DevicesResponse | Device[]>('/v1/devices', { token })
  if (Array.isArray(data)) return data
  return data.devices ?? []
}

export async function deleteDevice(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/v1/devices/${id}`, { method: 'DELETE', token })
}
