'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/AuthProvider'
import {
  updateProfile,
  updateUsername,
  updateEmail,
  updatePassword,
  deleteAccount,
} from '@/lib/user'
import { getSyncSettings, updateSyncSettings, normalizeSync } from '@/lib/profile'
import { apiFetch } from '@/lib/api'
import type { SyncSettings, User } from '@/types'
import { AlertTriangle, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { token, user, logout, refreshUser } = useUser()

  return (
    <div className="p-8 max-w-xl flex flex-col gap-10">
      <div>
        <h1 className="sf-display text-3xl">Settings</h1>
        <p className="text-sf-dim text-sm mt-1">Account and sync preferences</p>
      </div>

      <ProfileSection token={token} user={user} refreshUser={refreshUser} />
      <hr className="border-sf-b1" />
      <UsernameSection token={token} user={user} refreshUser={refreshUser} />
      <hr className="border-sf-b1" />
      <EmailSection token={token} user={user} refreshUser={refreshUser} />
      <hr className="border-sf-b1" />
      <PasswordSection token={token} />
      <hr className="border-sf-b1" />
      <SyncSection token={token} />
      <hr className="border-sf-b1" />
      <DangerSection token={token} logout={logout} />
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="sf-label">{title}</span>
        {description && (
          <p className="text-xs text-sf-dim leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm">
      {msg}
    </div>
  )
}

function SuccessMsg({ msg }: { msg: string }) {
  return (
    <div className="bg-sf-green-d border border-sf-green/20 text-sf-green text-sm p-3 rounded-sm">
      {msg}
    </div>
  )
}

function ProfileSection({
  token,
  user,
  refreshUser,
}: {
  token: string | null
  user: User | null
  refreshUser: (u: User) => void
}) {
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.display_name ?? '')
    setAvatarUrl(user.avatar_url ?? '')
    setBio(user.bio ?? '')
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await updateProfile(token, {
        display_name: displayName || '',
        avatar_url: avatarUrl || '',
        bio: bio || '',
      })
      refreshUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section title="Profile" description="Public information on your account.">
      <form onSubmit={handleSave} className="sf-card flex flex-col gap-4">
        {error && <ErrorMsg msg={error} />}
        {success && <SuccessMsg msg="Profile updated" />}

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-sf-s2 border border-sf-b1 overflow-hidden shrink-0 flex items-center justify-center text-sf-hint text-xs">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-provided external URL
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <span className="font-mono text-lg">
                {(user?.username ?? '?').slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="sf-label">Avatar URL</label>
            <input
              type="url"
              className="sf-input"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Display name</label>
          <input
            type="text"
            className="sf-input"
            placeholder={user?.username ?? 'Your name'}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Bio</label>
          <textarea
            className="sf-input resize-none h-20"
            placeholder="Shell enthusiast"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </Section>
  )
}

function UsernameSection({
  token,
  user,
  refreshUser,
}: {
  token: string | null
  user: User | null
  refreshUser: (u: User) => void
}) {
  const [username, setUsername] = useState(user?.username ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) setUsername(user.username)
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !username.trim()) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await updateUsername(token, username.trim())
      refreshUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update username')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section
      title="Username"
      description="3–30 characters. Letters, numbers and underscores only."
    >
      <form onSubmit={handleSave} className="sf-card flex flex-col gap-4">
        {error && <ErrorMsg msg={error} />}
        {success && <SuccessMsg msg="Username updated" />}

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Username</label>
          <input
            type="text"
            className="sf-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            required
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Update username'}
          </button>
        </div>
      </form>
    </Section>
  )
}

function EmailSection({
  token,
  user,
  refreshUser,
}: {
  token: string | null
  user: User | null
  refreshUser: (u: User) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await updateEmail(token, email.trim(), password)
      refreshUser(updated)
      setEmail('')
      setPassword('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update email')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section
      title="Email"
      description={`Current: ${user?.email ?? '—'}. Requires your password to change.`}
    >
      <form onSubmit={handleSave} className="sf-card flex flex-col gap-4">
        {error && <ErrorMsg msg={error} />}
        {success && <SuccessMsg msg="Email updated" />}

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">New email</label>
          <input
            type="email"
            className="sf-input"
            placeholder="nuevo@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Current password</label>
          <input
            type="password"
            className="sf-input"
            placeholder="············"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Update email'}
          </button>
        </div>
      </form>
    </Section>
  )
}

function PasswordSection({ token }: { token: string | null }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const mismatch = confirm.length > 0 && next !== confirm

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token || mismatch) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await updatePassword(token, current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section title="Password" description="Minimum 8 characters.">
      <form onSubmit={handleSave} className="sf-card flex flex-col gap-4">
        {error && <ErrorMsg msg={error} />}
        {success && <SuccessMsg msg="Password updated" />}

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Current password</label>
          <input
            type="password"
            className="sf-input"
            placeholder="············"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">New password</label>
          <input
            type="password"
            className="sf-input"
            placeholder="············"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Confirm new password</label>
          <input
            type="password"
            className={`sf-input ${mismatch ? 'border-sf-red/50' : ''}`}
            placeholder="············"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {mismatch && (
            <span className="text-sf-red text-xs tracking-wide">
              Passwords don&apos;t match
            </span>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || mismatch}
            className="btn-primary"
          >
            {saving ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </Section>
  )
}

function SyncSection({ token }: { token: string | null }) {
  const [sync, setSync] = useState<SyncSettings | null>(null)
  const [original, setOriginal] = useState<SyncSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!token) return
    getSyncSettings(token)
      .then((d) => {
        const normalized = normalizeSync(d)
        setSync(normalized)
        setOriginal(normalized)
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load sync settings')
      )
      .finally(() => setLoading(false))
  }, [token])

  const hasChanges =
    sync && original && JSON.stringify(sync) !== JSON.stringify(original)

  function toggle(key: keyof SyncSettings) {
    setSync((prev) => (prev ? { ...prev, [key]: !prev[key] } : null))
    setSaved(false)
  }

  async function handleSave() {
    if (!token || !sync) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateSyncSettings(token, sync)
      const normalized = normalizeSync(updated)
      setSync(normalized)
      setOriginal(normalized)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section
      title="Sync preferences"
      description="Choose what ShellForge syncs across your devices. Changes are pushed to connected daemons in real time."
    >
      {error && <ErrorMsg msg={error} />}

      {loading ? (
        <div className="sf-card h-48 animate-pulse bg-sf-s2" />
      ) : sync ? (
        <div className="sf-card flex flex-col gap-1 divide-y divide-sf-b1">
          <SyncToggle
            label="Themes"
            description="Colors, fonts and terminal appearance"
            enabled={sync.sync_theme}
            onToggle={() => toggle('sync_theme')}
          />
          <SyncToggle
            label="Aliases"
            description="Shell aliases synced across devices"
            enabled={sync.sync_aliases}
            onToggle={() => toggle('sync_aliases')}
          />
          <SyncToggle
            label="Commands"
            description="Custom commands"
            enabled={sync.sync_commands}
            onToggle={() => toggle('sync_commands')}
          />
          <SyncToggle
            label="Tabs"
            description="Panel layout and tab configuration"
            enabled={sync.sync_tabs}
            onToggle={() => toggle('sync_tabs')}
          />
          <SyncToggle
            label="History"
            description="Command history across devices"
            enabled={sync.sync_history}
            onToggle={() => toggle('sync_history')}
            warning="Command history is stored on our servers. Only enable if you're comfortable with that."
          />
        </div>
      ) : null}

      <div className="flex items-center gap-3 h-9">
        {hasChanges && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        )}
        {saved && !hasChanges && (
          <span className="text-sf-green text-xs tracking-wide">Preferences saved</span>
        )}
      </div>
    </Section>
  )
}

function SyncToggle({
  label,
  description,
  enabled,
  onToggle,
  warning,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  warning?: string
}) {
  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-sf-text">{label}</span>
          <span className="text-xs text-sf-dim leading-relaxed">{description}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={`relative shrink-0 w-10 h-5 rounded-full border transition-colors ${
            enabled ? 'bg-sf-text border-sf-text' : 'bg-transparent border-sf-b2'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
              enabled ? 'left-[22px] bg-sf-bg' : 'left-0.5 bg-sf-hint'
            }`}
          />
        </button>
      </div>
      {warning && enabled && (
        <div className="flex items-start gap-2 bg-sf-amber-d border border-sf-amber/20 rounded-sm px-3 py-2">
          <AlertTriangle size={12} className="text-sf-amber shrink-0 mt-0.5" />
          <span className="text-xs text-sf-amber leading-relaxed">{warning}</span>
        </div>
      )}
    </div>
  )
}

function DangerSection({
  token,
  logout,
}: {
  token: string | null
  logout: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    try {
      const refresh = localStorage.getItem('sf_refresh')
      if (refresh) {
        await apiFetch('/v1/auth/logout', {
          method: 'POST',
          body: { refresh_token: refresh },
        }).catch(() => {})
      }
    } finally {
      logout()
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !password) return
    setDeleting(true)
    setError(null)
    try {
      await deleteAccount(token, password)
      logout()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <Section title="Danger zone">
      <div className="sf-card flex flex-col gap-4 border-sf-red/20">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-sf-text">Sign out</span>
            <span className="text-xs text-sf-dim">End your current session</span>
          </div>
          <button type="button" onClick={handleSignOut} className="btn-ghost text-xs">
            Sign out
          </button>
        </div>

        <div className="border-t border-sf-b1" />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-sf-red">Delete account</span>
            <span className="text-xs text-sf-dim leading-relaxed">
              Permanently deletes your account, devices, themes, aliases and history.
              This cannot be undone.
            </span>
          </div>

          {!confirm ? (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="btn-danger text-xs w-fit"
            >
              <Trash2 size={12} /> Delete account
            </button>
          ) : (
            <form
              onSubmit={handleDelete}
              className="flex flex-col gap-3 border border-sf-red/20 rounded-sm p-3 bg-sf-red-d"
            >
              {error && <ErrorMsg msg={error} />}
              <p className="text-xs text-sf-red leading-relaxed">
                Enter your password to confirm. This action is permanent.
              </p>
              <input
                type="password"
                className="sf-input"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button type="submit" disabled={deleting} className="btn-danger text-xs">
                  <Trash2 size={12} />
                  {deleting ? 'Deleting…' : 'Yes, delete my account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirm(false)
                    setPassword('')
                    setError(null)
                  }}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Section>
  )
}
