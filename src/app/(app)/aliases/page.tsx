'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/AuthProvider'
import {
  getAliases,
  upsertAlias,
  deleteAlias,
  getCommands,
  upsertCommand,
  deleteCommand,
} from '@/lib/profile'
import type { Alias, CustomCommand } from '@/types'
import { Plus, Trash2, Check, X, Pencil } from 'lucide-react'

type Tab = 'aliases' | 'commands'

export default function AliasesPage() {
  const { token } = useUser()
  const [tab, setTab] = useState<Tab>('aliases')

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="sf-display text-3xl">Aliases & commands</h1>
        <p className="text-sf-dim text-sm mt-1">Define shortcuts for your terminal</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-sf-b1 pb-0">
        {(['aliases', 'commands'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs tracking-wide capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'text-sf-text border-sf-text'
                : 'text-sf-hint border-transparent hover:text-sf-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'aliases' && <AliasesPanel token={token} />}
      {tab === 'commands' && <CommandsPanel token={token} />}
    </div>
  )
}

function AliasesPanel({ token }: { token: string | null }) {
  const [aliases, setAliases] = useState<Alias[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newCommand, setNewCommand] = useState('')
  const [adding, setAdding] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editCommand, setEditCommand] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getAliases(token)
      .then(setAliases)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load aliases')
      )
      .finally(() => setLoading(false))
  }, [token])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !newName.trim() || !newCommand.trim()) return
    setAdding(true)
    setError(null)
    try {
      const alias = await upsertAlias(token, {
        name: newName.trim(),
        command: newCommand.trim(),
      })
      setAliases((prev) => {
        const exists = prev.findIndex((a) => a.id === alias.id)
        return exists >= 0
          ? prev.map((a) => (a.id === alias.id ? alias : a))
          : [...prev, alias]
      })
      setNewName('')
      setNewCommand('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add alias')
    } finally {
      setAdding(false)
    }
  }

  function startEdit(alias: Alias) {
    setEditId(alias.id)
    setEditName(alias.name)
    setEditCommand(alias.command)
  }

  function cancelEdit() {
    setEditId(null)
    setEditName('')
    setEditCommand('')
  }

  async function handleSaveEdit(alias: Alias) {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      const updated = await upsertAlias(token, {
        name: editName.trim(),
        command: editCommand.trim(),
      })
      setAliases((prev) => prev.map((a) => (a.id === alias.id ? updated : a)))
      cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update alias')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!token) return
    setDeleting(id)
    try {
      await deleteAlias(token, id)
      setAliases((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete alias')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="sf-card flex flex-col gap-3">
        <span className="sf-label">New alias</span>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex flex-col gap-1.5 w-32">
            <label className="sf-label">Name</label>
            <input
              type="text"
              className="sf-input"
              placeholder="ll"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-48">
            <label className="sf-label">Command</label>
            <input
              type="text"
              className="sf-input"
              placeholder="ls -la"
              value={newCommand}
              onChange={(e) => setNewCommand(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary shrink-0">
            <Plus size={14} />
            {adding ? 'Adding…' : 'Add alias'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-sf-s2 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : aliases.length === 0 ? (
        <div className="py-12 text-center">
          <p className="sf-display text-xl text-sf-hint mb-1">No aliases yet</p>
          <p className="text-sf-dim text-sm">Add your first alias above</p>
        </div>
      ) : (
        <div className="flex flex-col border border-sf-b1 rounded-md overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-4 py-2 bg-sf-s2 border-b border-sf-b1">
            <span className="sf-label">Name</span>
            <span className="sf-label">Command</span>
            <span className="sf-label">Actions</span>
          </div>

          {aliases.map((alias, i) => (
            <div
              key={alias.id}
              className={`grid grid-cols-[1fr_2fr_auto] gap-4 px-4 py-3 items-center
                ${i < aliases.length - 1 ? 'border-b border-sf-b1' : ''}
                ${editId === alias.id ? 'bg-sf-s2' : 'hover:bg-sf-s1 transition-colors'}
              `}
            >
              {editId === alias.id ? (
                <>
                  <input
                    type="text"
                    className="sf-input text-xs"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="sf-input text-xs"
                    value={editCommand}
                    onChange={(e) => setEditCommand(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(alias)}
                      disabled={saving}
                      className="text-sf-green hover:opacity-70 transition-opacity"
                      aria-label="Save"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sf-hint hover:text-sf-text transition-colors"
                      aria-label="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-sm font-mono text-sf-text">{alias.name}</span>
                  <span className="text-sm font-mono text-sf-muted truncate">
                    {alias.command}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(alias)}
                      className="text-sf-hint hover:text-sf-text transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(alias.id)}
                      disabled={deleting === alias.id}
                      className="text-sf-hint hover:text-sf-red transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CommandsPanel({ token }: { token: string | null }) {
  const [commands, setCommands] = useState<CustomCommand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newScript, setNewScript] = useState('')
  const [adding, setAdding] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editScript, setEditScript] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getCommands(token)
      .then(setCommands)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load commands')
      )
      .finally(() => setLoading(false))
  }, [token])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !newName.trim() || !newScript.trim()) return
    setAdding(true)
    setError(null)
    try {
      const cmd = await upsertCommand(token, {
        name: newName.trim(),
        description: newDesc.trim(),
        script: newScript.trim(),
      })
      setCommands((prev) => {
        const exists = prev.findIndex((c) => c.id === cmd.id)
        return exists >= 0
          ? prev.map((c) => (c.id === cmd.id ? cmd : c))
          : [...prev, cmd]
      })
      setNewName('')
      setNewDesc('')
      setNewScript('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add command')
    } finally {
      setAdding(false)
    }
  }

  function startEdit(cmd: CustomCommand) {
    setEditId(cmd.id)
    setEditName(cmd.name)
    setEditDesc(cmd.description)
    setEditScript(cmd.script)
  }

  function cancelEdit() {
    setEditId(null)
  }

  async function handleSaveEdit() {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      const updated = await upsertCommand(token, {
        name: editName.trim(),
        description: editDesc.trim(),
        script: editScript.trim(),
      })
      setCommands((prev) => prev.map((c) => (c.id === editId ? updated : c)))
      cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update command')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!token) return
    setDeleting(id)
    try {
      await deleteCommand(token, id)
      setCommands((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete command')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="sf-card flex flex-col gap-3">
        <span className="sf-label">New command</span>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1.5 w-36">
            <label className="sf-label">Name</label>
            <input
              type="text"
              className="sf-input"
              placeholder="deploy"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-48">
            <label className="sf-label">Description</label>
            <input
              type="text"
              className="sf-input"
              placeholder="Deploy to production"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Script</label>
          <textarea
            className="sf-input resize-none h-20"
            placeholder="./deploy.sh prod"
            value={newScript}
            onChange={(e) => setNewScript(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={adding} className="btn-primary">
            <Plus size={14} />
            {adding ? 'Adding…' : 'Add command'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-sf-s2 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : commands.length === 0 ? (
        <div className="py-12 text-center">
          <p className="sf-display text-xl text-sf-hint mb-1">No commands yet</p>
          <p className="text-sf-dim text-sm">Add your first custom command above</p>
        </div>
      ) : (
        <div className="flex flex-col border border-sf-b1 rounded-md overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-4 py-2 bg-sf-s2 border-b border-sf-b1">
            <span className="sf-label">Name</span>
            <span className="sf-label">Description / script</span>
            <span className="sf-label">Actions</span>
          </div>

          {commands.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`px-4 py-3 ${i < commands.length - 1 ? 'border-b border-sf-b1' : ''}
                ${editId === cmd.id ? 'bg-sf-s2' : 'hover:bg-sf-s1 transition-colors'}`}
            >
              {editId === cmd.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="flex flex-col gap-1 w-36">
                      <label className="sf-label">Name</label>
                      <input
                        type="text"
                        className="sf-input text-xs"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-48">
                      <label className="sf-label">Description</label>
                      <input
                        type="text"
                        className="sf-input text-xs"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="sf-label">Script</label>
                    <textarea
                      className="sf-input resize-none h-16 text-xs"
                      value={editScript}
                      onChange={(e) => setEditScript(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="btn-primary text-xs"
                    >
                      <Check size={12} />
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={cancelEdit} className="btn-ghost text-xs">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[1fr_2fr_auto] gap-4 items-start">
                  <span className="text-sm font-mono text-sf-text pt-0.5">{cmd.name}</span>
                  <div className="flex flex-col gap-1 min-w-0">
                    {cmd.description && (
                      <span className="text-xs text-sf-muted truncate">
                        {cmd.description}
                      </span>
                    )}
                    <span className="text-xs font-mono text-sf-hint truncate">
                      {cmd.script}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => startEdit(cmd)}
                      className="text-sf-hint hover:text-sf-text transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cmd.id)}
                      disabled={deleting === cmd.id}
                      className="text-sf-hint hover:text-sf-red transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
