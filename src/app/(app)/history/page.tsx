'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@/components/providers/AuthProvider'
import { getHistory, clearHistory } from '@/lib/history'
import { getDevices } from '@/lib/devices'
import { getSyncSettings } from '@/lib/profile'
import type { HistoryEntry, Device } from '@/types'
import { Search, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

const LIMIT = 50

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function HistoryPage() {
  const { token } = useUser()

  const [syncEnabled, setSyncEnabled] = useState<boolean | null>(null)
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [total, setTotal] = useState(0)
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [offset, setOffset] = useState(0)

  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    if (!token) return
    getSyncSettings(token)
      .then((s) => setSyncEnabled(s?.sync_history ?? false))
      .catch(() => setSyncEnabled(false))
  }, [token])

  useEffect(() => {
    if (!token) return
    getDevices(token)
      .then((data) => setDevices(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setOffset(0)
  }, [debouncedSearch, deviceId])

  const loadHistory = useCallback(async () => {
    if (!token || !syncEnabled) return
    setLoading(true)
    setError(null)
    try {
      const res = await getHistory(token, {
        search: debouncedSearch || undefined,
        device_id: deviceId || undefined,
        limit: LIMIT,
        offset,
      })
      setEntries(res.entries ?? [])
      setTotal(res.total ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [token, syncEnabled, debouncedSearch, deviceId, offset])

  useEffect(() => {
    if (syncEnabled === null) return
    if (!syncEnabled) {
      setLoading(false)
      return
    }
    loadHistory()
  }, [loadHistory, syncEnabled])

  async function handleClear() {
    if (!token) return
    setClearing(true)
    setError(null)
    try {
      await clearHistory(token)
      setEntries([])
      setTotal(0)
      setConfirmClear(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear history')
    } finally {
      setClearing(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="sf-display text-3xl">History</h1>
        <p className="text-sf-dim text-sm mt-1">Commands executed across your devices</p>
      </div>

      {syncEnabled === false && (
        <div className="sf-card flex items-start gap-3 border-sf-amber/20 bg-sf-amber-d mb-6">
          <AlertTriangle size={16} className="text-sf-amber shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-sf-amber">History sync is disabled</span>
            <span className="text-xs text-sf-amber/70 leading-relaxed">
              Enable history sync in your settings to start recording commands.
            </span>
            <Link
              href="/settings"
              className="text-xs text-sf-amber underline underline-offset-2 mt-1 w-fit"
            >
              Go to settings →
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm mb-6">
          {error}
        </div>
      )}

      {syncEnabled && (
        <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sf-hint"
              />
              <input
                type="text"
                className="sf-input pl-8"
                placeholder="Search commands…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="sf-input w-44"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              <option value="">All devices</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-sf-red tracking-wide">
                  Clear all history?
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={clearing}
                  className="btn-danger text-xs py-1.5 px-3"
                >
                  {clearing ? '…' : 'Yes, clear'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="btn-ghost text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="btn-danger text-xs py-1.5 px-3"
              >
                <Trash2 size={12} /> Clear history
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-sf-s2 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center">
              <p className="sf-display text-xl text-sf-hint mb-1">No commands found</p>
              <p className="text-sf-dim text-sm">
                {debouncedSearch ? 'Try a different search term' : 'No history recorded yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="border border-sf-b1 rounded-md overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] gap-4 px-4 py-2 bg-sf-s2 border-b border-sf-b1">
                  <span className="sf-label">Command</span>
                  <span className="sf-label">Directory</span>
                  <span className="sf-label">Device</span>
                  <span className="sf-label">Exit</span>
                  <span className="sf-label">Duration</span>
                  <span className="sf-label">Time</span>
                </div>

                {entries.map((entry, i) => {
                  const device = devices.find((d) => d.id === entry.device_id)
                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] gap-4 px-4 py-2.5 items-center
                        hover:bg-sf-s1 transition-colors
                        ${i < entries.length - 1 ? 'border-b border-sf-b1' : ''}
                      `}
                    >
                      <span className="text-xs font-mono text-sf-text truncate">
                        {entry.command}
                      </span>
                      <span className="text-xs font-mono text-sf-hint truncate">
                        {entry.cwd || '—'}
                      </span>
                      <span className="text-xs text-sf-dim truncate">
                        {device?.name ?? '—'}
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          entry.exit_code === 0 ? 'text-sf-green' : 'text-sf-red'
                        }`}
                      >
                        {entry.exit_code}
                      </span>
                      <span className="text-xs font-mono text-sf-hint">
                        {formatDuration(entry.duration_ms)}
                      </span>
                      <span className="text-xs text-sf-hint whitespace-nowrap">
                        {timeAgo(entry.executed_at)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-sf-hint">
                  {total.toLocaleString()} {total === 1 ? 'entry' : 'entries'} total
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
                      disabled={offset === 0}
                      className="btn-ghost text-xs py-1.5 px-2 disabled:opacity-30"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <span className="text-xs text-sf-hint">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOffset((o) => o + LIMIT)}
                      disabled={offset + LIMIT >= total}
                      className="btn-ghost text-xs py-1.5 px-2 disabled:opacity-30"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
