'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/AuthProvider'
import { getDevices, deleteDevice } from '@/lib/devices'
import type { Device } from '@/types'
import { Laptop, Monitor, Apple, Trash2, Terminal, Clock, Calendar } from 'lucide-react'

function osIcon(os: Device['os']) {
  if (os === 'macos') return <Apple size={16} />
  if (os === 'windows') return <Monitor size={16} />
  return <Laptop size={16} />
}

function osLabel(os: Device['os']) {
  if (os === 'macos') return 'macOS'
  if (os === 'windows') return 'Windows'
  return 'Linux'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DevicesPage() {
  const { token } = useUser()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getDevices(token)
      .then(setDevices)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load devices')
      )
      .finally(() => setLoading(false))
  }, [token])

  async function handleRevoke(id: string) {
    if (!token) return
    setDeleting(id)
    setError(null)
    try {
      await deleteDevice(token, id)
      setDevices((prev) => prev.filter((d) => d.id !== id))
      setConfirmId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to revoke device')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="sf-display text-3xl">Devices</h1>
        <p className="text-sf-dim text-sm mt-1">
          Machines connected to your account
        </p>
      </div>

      {error && (
        <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="sf-card h-32 animate-pulse bg-sf-s2" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              confirming={confirmId === device.id}
              deleting={deleting === device.id}
              onRequestRevoke={() => setConfirmId(device.id)}
              onConfirmRevoke={() => handleRevoke(device.id)}
              onCancelRevoke={() => setConfirmId(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface DeviceCardProps {
  device: Device
  confirming: boolean
  deleting: boolean
  onRequestRevoke: () => void
  onConfirmRevoke: () => void
  onCancelRevoke: () => void
}

function DeviceCard({
  device,
  confirming,
  deleting,
  onRequestRevoke,
  onConfirmRevoke,
  onCancelRevoke,
}: DeviceCardProps) {
  return (
    <div className="sf-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-sf-s2 border border-sf-b1 flex items-center justify-center text-sf-muted shrink-0">
            {osIcon(device.os)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="sf-display text-lg leading-none">{device.name}</span>
            <span className="text-[10px] text-sf-hint font-mono tracking-wide">
              {device.hostname}
            </span>
          </div>
        </div>
        <span className="badge badge-syncing shrink-0">
          {osLabel(device.os)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <MetaRow label="Architecture" value={device.arch} />
        <MetaRow label="OS version" value={device.os_version} />
        <MetaRow
          label="Shell"
          value={device.shell}
          icon={<Terminal size={11} className="text-sf-hint" />}
        />
        <MetaRow label="SF version" value={`v${device.sf_version}`} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-sf-b1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] text-sf-hint">
            <Clock size={10} />
            <span>Last seen {timeAgo(device.last_seen_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-sf-hint">
            <Calendar size={10} />
            <span>Added {formatDate(device.created_at)}</span>
          </div>
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-sf-red tracking-wide">Revoke access?</span>
            <button
              type="button"
              onClick={onConfirmRevoke}
              disabled={deleting}
              className="btn-danger text-xs py-1 px-2"
            >
              {deleting ? '…' : 'Yes, revoke'}
            </button>
            <button
              type="button"
              onClick={onCancelRevoke}
              className="btn-ghost text-xs py-1 px-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequestRevoke}
            className="btn-danger text-xs py-1 px-2"
          >
            <Trash2 size={12} /> Revoke
          </button>
        )}
      </div>
    </div>
  )
}

function MetaRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="sf-label">{label}</span>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-xs font-mono text-sf-muted">{value}</span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="sf-card flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="sf-display text-xl text-sf-hint">No devices connected</p>
        <p className="text-sf-dim text-sm">
          Install the ShellForge daemon on your machine to start syncing.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="sf-label">Linux / macOS</span>
        <div className="bg-sf-bg border border-sf-b1 rounded-sm p-3 font-mono text-xs text-sf-muted leading-relaxed">
          <span className="text-sf-hint">$</span>{' '}
          <span className="text-sf-text">
            curl -fsSL https://get.shellforge.dev | bash
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="sf-label">After installing, authenticate</span>
        <div className="bg-sf-bg border border-sf-b1 rounded-sm p-3 font-mono text-xs text-sf-muted leading-relaxed">
          <span className="text-sf-hint">$</span>{' '}
          <span className="text-sf-text">shellforge auth login</span>
        </div>
      </div>
    </div>
  )
}
