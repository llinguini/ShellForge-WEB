export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Device {
  id: string
  name: string
  os: 'linux' | 'macos' | 'windows'
  os_version: string
  arch: string
  hostname: string
  shell: string
  sf_version: string
  last_seen_at: string
  created_at: string
}

export interface Theme {
  id: string
  name: string
  colors: Record<string, string>
  font_family: string
  font_size: number
  is_active: boolean
  is_system: boolean
  updated_at: string
}

export interface Alias {
  id: string
  name: string
  command: string
  updated_at: string
}

export interface CustomCommand {
  id: string
  name: string
  script: string
  description: string
  updated_at: string
}

export interface HistoryEntry {
  id: string
  command: string
  cwd: string
  exit_code: number
  duration_ms: number
  executed_at: string
  device_id: string
}

export interface SyncSettings {
  sync_theme: boolean
  sync_aliases: boolean
  sync_commands: boolean
  sync_tabs: boolean
  sync_history: boolean
}
