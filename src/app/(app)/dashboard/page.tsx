'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@/components/providers/AuthProvider'
import { getProfile, type FullProfile } from '@/lib/profile'
import { Palette, Terminal, Laptop, ArrowRight, Plus } from 'lucide-react'

function greeting(username: string | undefined) {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return `Good ${time}${username ? `, ${username}` : ''}`
}

export default function DashboardPage() {
  const { token, user } = useUser()
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getProfile(token)
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="p-8 max-w-4xl">

      <div className="mb-8 flex items-start gap-3">
        <Image
          src="/icon.svg"
          alt=""
          width={32}
          height={32}
          className="mt-1 shrink-0"
          priority
        />
        <div>
          <h1 className="sf-display text-3xl">Dashboard</h1>
          <p className="text-sf-dim text-sm mt-1">{greeting(user?.username)}</p>
        </div>
      </div>

      {error && (
        <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <StatCard
          label="Aliases"
          value={loading ? '—' : String(profile?.aliases?.length ?? 0)}
          icon={<Terminal size={14} className="text-sf-hint" />}
        />
        <StatCard
          label="Commands"
          value={loading ? '—' : String(profile?.commands?.length ?? 0)}
          icon={<Terminal size={14} className="text-sf-hint" />}
        />
        <StatCard
          label="Active theme"
          value={loading ? '—' : (profile?.active_theme?.name ?? 'None')}
          icon={<Palette size={14} className="text-sf-hint" />}
          mono={false}
        />
        <StatCard
          label="Sync"
          value={loading ? '—' : syncSummary(profile?.sync)}
          icon={<Laptop size={14} className="text-sf-hint" />}
          mono={false}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="sf-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="sf-label">Active theme</span>
            <Link
              href="/themes"
              className="text-[10px] text-sf-hint hover:text-sf-muted transition-colors tracking-wide flex items-center gap-1"
            >
              Manage <ArrowRight size={10} />
            </Link>
          </div>

          {loading ? (
            <div className="h-16 bg-sf-s2 rounded-sm animate-pulse" />
          ) : profile?.active_theme ? (
            <div className="flex flex-col gap-3">
              <span className="sf-display text-lg">{profile.active_theme.name}</span>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(profile.active_theme.colors ?? {}).slice(0, 8).map(([key, val]) => (
                  <div
                    key={key}
                    className="w-5 h-5 rounded-sm border border-sf-b1"
                    style={{ background: val }}
                    title={`${key}: ${val}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-sf-hint tracking-wide font-mono">
                {profile.active_theme.font_family} · {profile.active_theme.font_size}px
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sf-dim text-sm">No active theme</p>
              <Link href="/themes" className="btn-secondary text-xs w-fit">
                <Plus size={12} /> Create theme
              </Link>
            </div>
          )}
        </div>

        <div className="sf-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="sf-label">Sync settings</span>
            <Link
              href="/settings"
              className="text-[10px] text-sf-hint hover:text-sf-muted transition-colors tracking-wide flex items-center gap-1"
            >
              Edit <ArrowRight size={10} />
            </Link>
          </div>

          {loading ? (
            <div className="h-16 bg-sf-s2 rounded-sm animate-pulse" />
          ) : (
            <div className="flex flex-col gap-2">
              {[
                { key: 'sync_theme',    label: 'Themes'   },
                { key: 'sync_aliases',  label: 'Aliases'  },
                { key: 'sync_commands', label: 'Commands' },
                { key: 'sync_tabs',     label: 'Tabs'     },
                { key: 'sync_history',  label: 'History'  },
              ].map(({ key, label }) => {
                const active = profile?.sync?.[key as keyof NonNullable<FullProfile['sync']>] ?? false
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-sf-muted tracking-wide">{label}</span>
                    <span className={`badge ${active ? 'badge-online' : 'badge-offline'}`}>
                      {active ? 'On' : 'Off'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      <div className="mt-6">
        <span className="sf-label block mb-3">Quick actions</span>
        <div className="flex gap-3 flex-wrap">
          <Link href="/aliases" className="btn-secondary text-xs">
            <Plus size={12} /> New alias
          </Link>
          <Link href="/aliases" className="btn-secondary text-xs">
            <Plus size={12} /> New command
          </Link>
          <Link href="/devices" className="btn-secondary text-xs">
            <Plus size={12} /> Add device
          </Link>
          <Link href="/themes" className="btn-secondary text-xs">
            <Plus size={12} /> New theme
          </Link>
        </div>
      </div>

    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  mono?: boolean
}

function StatCard({ label, value, icon, mono = true }: StatCardProps) {
  return (
    <div className="sf-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="sf-label">{label}</span>
        {icon}
      </div>
      <span className={`sf-num text-3xl ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function syncSummary(sync: FullProfile['sync'] | undefined): string {
  if (!sync) return '—'
  const count = Object.values(sync).filter(Boolean).length
  return `${count} / 5`
}
