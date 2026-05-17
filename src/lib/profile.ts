import { apiFetch } from './api'
import type { Theme, Alias, CustomCommand, SyncSettings } from '@/types'

export interface FullProfile {
  active_theme: Theme | null
  aliases: Alias[]
  commands: CustomCommand[]
  tabs: { layout: Record<string, unknown> }
  sync: SyncSettings
}

const DEFAULT_SYNC: SyncSettings = {
  sync_theme: false,
  sync_aliases: false,
  sync_commands: false,
  sync_tabs: false,
  sync_history: false,
}

/** Raw shape from GET /v1/profile */
interface ApiProfileRaw {
  theme?: Theme | null
  active_theme?: Theme | null
  aliases?: Alias[]
  commands?: CustomCommand[]
  tab_config?: Record<string, unknown> | null
  tabs?: { layout: Record<string, unknown> }
  sync?: Partial<SyncSettings>
  sync_settings?: Partial<SyncSettings>
}

export function normalizeSync(raw?: Partial<SyncSettings>): SyncSettings {
  return {
    sync_theme: raw?.sync_theme ?? false,
    sync_aliases: raw?.sync_aliases ?? false,
    sync_commands: raw?.sync_commands ?? false,
    sync_tabs: raw?.sync_tabs ?? false,
    sync_history: raw?.sync_history ?? false,
  }
}

export function normalizeProfile(data: ApiProfileRaw): FullProfile {
  const syncRaw = data.sync ?? data.sync_settings
  return {
    active_theme: data.active_theme ?? data.theme ?? null,
    aliases: data.aliases ?? [],
    commands: data.commands ?? [],
    tabs: data.tabs ?? { layout: data.tab_config ?? {} },
    sync: normalizeSync(syncRaw),
  }
}

export async function getProfile(token: string): Promise<FullProfile> {
  const data = await apiFetch<ApiProfileRaw>('/v1/profile', { token })
  return normalizeProfile(data)
}

export interface ThemesResponse {
  themes: Theme[]
}

export async function getThemes(token: string): Promise<Theme[]> {
  const data = await apiFetch<ThemesResponse | Theme[]>(
    '/v1/profile/themes',
    { token },
  )
  return unwrapList(data, 'themes')
}

export async function createTheme(
  token: string,
  data: Omit<Theme, 'id' | 'is_active' | 'is_system' | 'updated_at'>,
): Promise<Theme> {
  return apiFetch<Theme>('/v1/profile/themes', { method: 'POST', token, body: data })
}

export async function updateTheme(
  token: string,
  id: string,
  data: Partial<Theme>,
): Promise<Theme> {
  return apiFetch<Theme>(`/v1/profile/themes/${id}`, { method: 'PUT', token, body: data })
}

export async function activateTheme(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/v1/profile/themes/${id}/activate`, { method: 'PATCH', token })
}

export async function deleteTheme(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/v1/profile/themes/${id}`, { method: 'DELETE', token })
}

export interface AliasesResponse {
  aliases: Alias[]
}

function unwrapList<T>(
  data: T[] | Record<string, T[] | undefined>,
  key: string,
): T[] {
  if (Array.isArray(data)) return data
  const list = data[key]
  return Array.isArray(list) ? list : []
}

export async function getAliases(token: string): Promise<Alias[]> {
  const data = await apiFetch<AliasesResponse | Alias[]>(
    '/v1/profile/aliases',
    { token },
  )
  return unwrapList(data, 'aliases')
}

export async function upsertAlias(
  token: string,
  data: { name: string; command: string },
): Promise<Alias> {
  return apiFetch<Alias>('/v1/profile/aliases', { method: 'PUT', token, body: data })
}

export async function deleteAlias(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/v1/profile/aliases/${id}`, { method: 'DELETE', token })
}

export interface CommandsResponse {
  commands: CustomCommand[]
}

export async function getCommands(token: string): Promise<CustomCommand[]> {
  const data = await apiFetch<CommandsResponse | CustomCommand[]>(
    '/v1/profile/commands',
    { token },
  )
  return unwrapList(data, 'commands')
}

export async function upsertCommand(
  token: string,
  data: { name: string; script: string; description: string },
): Promise<CustomCommand> {
  return apiFetch<CustomCommand>('/v1/profile/commands', { method: 'PUT', token, body: data })
}

export async function deleteCommand(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/v1/profile/commands/${id}`, { method: 'DELETE', token })
}

type ApiSyncResponse = SyncSettings | { sync_settings: Partial<SyncSettings> }

function parseSyncResponse(data: ApiSyncResponse): SyncSettings {
  if ('sync_settings' in data && data.sync_settings) {
    return normalizeSync(data.sync_settings)
  }
  return normalizeSync(data as Partial<SyncSettings>)
}

export async function getSyncSettings(token: string): Promise<SyncSettings> {
  const data = await apiFetch<ApiSyncResponse>('/v1/profile/sync', { token })
  return parseSyncResponse(data)
}

export async function updateSyncSettings(
  token: string,
  data: Partial<SyncSettings>,
): Promise<SyncSettings> {
  const res = await apiFetch<ApiSyncResponse>('/v1/profile/sync', {
    method: 'PATCH',
    token,
    body: data,
  })
  return parseSyncResponse(res)
}
