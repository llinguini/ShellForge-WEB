'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/AuthProvider'
import {
  getThemes,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
} from '@/lib/profile'
import type { Theme } from '@/types'
import { Plus, X, Check, Trash2, Pencil, ChevronRight } from 'lucide-react'

const DEFAULT_COLORS: Record<string, string> = {
  bg:        '#1a1a1a',
  fg:        '#ede6d6',
  cursor:    '#ede6d6',
  selection: '#333028',
  black:     '#141210',
  red:       '#c05050',
  green:     '#5aad7a',
  yellow:    '#c8982a',
  blue:      '#5a8ad4',
  magenta:   '#a57aad',
  cyan:      '#5aadad',
  white:     '#ede6d6',
}

const FONT_OPTIONS = [
  'JetBrains Mono',
  'Fira Code',
  'Cascadia Code',
  'Source Code Pro',
  'Inconsolata',
  'Hack',
  'Courier New',
]

interface EditorState {
  mode: 'create' | 'edit'
  theme: Partial<Theme>
}

export default function ThemesPage() {
  const { token } = useUser()
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    getThemes(token)
      .then((data) => {
        if (!cancelled) setThemes(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load themes')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function openCreate() {
    setEditor({
      mode: 'create',
      theme: {
        name: '',
        colors: { ...DEFAULT_COLORS },
        font_family: 'JetBrains Mono',
        font_size: 14,
      },
    })
  }

  function openEdit(theme: Theme) {
    if (theme.is_system) return
    setEditor({
      mode: 'edit',
      theme: {
        ...theme,
        colors: { ...(theme.colors ?? {}) },
      },
    })
  }

  function closeEditor() {
    setEditor(null)
    setError(null)
  }

  async function handleSave() {
    if (!token || !editor) return
    setSaving(true)
    setError(null)
    try {
      const { name, colors, font_family, font_size } = editor.theme
      if (!name?.trim()) throw new Error('Theme name is required')

      if (editor.mode === 'create') {
        const created = await createTheme(token, {
          name: name.trim(),
          colors: colors ?? {},
          font_family: font_family ?? 'JetBrains Mono',
          font_size: font_size ?? 14,
        })
        setThemes((prev) => [...prev, created])
      } else {
        const updated = await updateTheme(token, editor.theme.id!, {
          name: name.trim(),
          colors: colors ?? {},
          font_family: font_family ?? 'JetBrains Mono',
          font_size: font_size ?? 14,
        })
        setThemes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      }
      closeEditor()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save theme')
    } finally {
      setSaving(false)
    }
  }

  async function handleActivate(id: string) {
    if (!token) return
    try {
      await activateTheme(token, id)
      setThemes((prev) => prev.map((t) => ({ ...t, is_active: t.id === id })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to activate theme')
    }
  }

  async function handleDelete(id: string) {
    if (!token) return
    setDeleting(id)
    try {
      await deleteTheme(token, id)
      setThemes((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete theme')
    } finally {
      setDeleting(null)
    }
  }

  function updateEditorField(field: keyof Theme, value: unknown) {
    setEditor((prev) =>
      prev ? { ...prev, theme: { ...prev.theme, [field]: value } } : null
    )
  }

  function updateColor(key: string, value: string) {
    setEditor((prev) => {
      if (!prev) return null
      return {
        ...prev,
        theme: {
          ...prev.theme,
          colors: { ...(prev.theme.colors ?? {}), [key]: value },
        },
      }
    })
  }

  function addColorKey() {
    const key = `color_${Object.keys(editor?.theme.colors ?? {}).length + 1}`
    updateColor(key, '#ffffff')
  }

  function removeColorKey(key: string) {
    setEditor((prev) => {
      if (!prev) return null
      const colors = { ...(prev.theme.colors ?? {}) }
      delete colors[key]
      return { ...prev, theme: { ...prev.theme, colors } }
    })
  }

  const colors = editor?.theme.colors ?? {}
  const previewBg = colors.bg ?? colors.background ?? '#1a1a1a'
  const previewFg = colors.fg ?? colors.foreground ?? '#ede6d6'
  const previewGreen = colors.green ?? '#5aad7a'
  const previewYellow = colors.yellow ?? '#c8982a'
  const previewCursor = colors.cursor ?? '#ede6d6'

  return (
    <div className="flex h-full">
      <style>{`
        @keyframes sf-cursor-blink {
          50% { opacity: 0; }
        }
      `}</style>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="sf-display text-3xl">Themes</h1>
            <p className="text-sf-dim text-sm mt-1">Manage your terminal themes</p>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus size={14} /> New theme
          </button>
        </div>

        {error && !editor && (
          <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="sf-card h-40 animate-pulse bg-sf-s2" />
            ))}
          </div>
        ) : themes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="sf-display text-xl text-sf-hint mb-2">No themes yet</p>
            <p className="text-sf-dim text-sm mb-6">
              Create your first theme to customize your terminal
            </p>
            <button type="button" onClick={openCreate} className="btn-secondary">
              <Plus size={14} /> Create theme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                deleting={deleting === theme.id}
                onActivate={() => handleActivate(theme.id)}
                onEdit={() => openEdit(theme)}
                onDelete={() => handleDelete(theme.id)}
              />
            ))}
          </div>
        )}
      </div>

      {editor && (
        <div className="w-96 border-l border-sf-b1 bg-sf-s1 flex flex-col overflow-hidden shrink-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-sf-b1">
            <span className="sf-label">
              {editor.mode === 'create' ? 'New theme' : 'Edit theme'}
            </span>
            <button
              type="button"
              onClick={closeEditor}
              className="text-sf-hint hover:text-sf-text transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
            {error && (
              <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="sf-label">Name</label>
              <input
                type="text"
                className="sf-input"
                placeholder="My theme"
                value={editor.theme.name ?? ''}
                onChange={(e) => updateEditorField('name', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="sf-label">Font family</label>
              <select
                className="sf-input"
                value={editor.theme.font_family ?? 'JetBrains Mono'}
                onChange={(e) => updateEditorField('font_family', e.target.value)}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="sf-label">
                Font size — {editor.theme.font_size ?? 14}px
              </label>
              <input
                type="range"
                min={10}
                max={20}
                step={1}
                value={editor.theme.font_size ?? 14}
                onChange={(e) => updateEditorField('font_size', Number(e.target.value))}
                className="w-full accent-sf-text"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="sf-label">Colors</label>
                <button
                  type="button"
                  onClick={addColorKey}
                  className="text-[10px] text-sf-hint hover:text-sf-muted transition-colors tracking-wide flex items-center gap-1"
                >
                  <Plus size={10} /> Add
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {Object.entries(editor.theme.colors ?? {}).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={val}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-7 h-7 rounded-sm border border-sf-b1 bg-sf-s2 cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-sf-muted font-mono flex-1">{key}</span>
                    <span className="text-xs text-sf-hint font-mono">{val}</span>
                    <button
                      type="button"
                      onClick={() => removeColorKey(key)}
                      className="text-sf-hint hover:text-sf-red transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="sf-label">Preview</label>
              <div
                className="rounded-md p-4 font-mono text-xs leading-relaxed"
                style={{
                  background: previewBg,
                  color: previewFg,
                  fontFamily: editor.theme.font_family ?? 'JetBrains Mono',
                  fontSize: `${editor.theme.font_size ?? 14}px`,
                }}
              >
                <div>
                  <span style={{ color: previewFg, opacity: 0.5 }}>~/projects</span>
                  {' '}
                  <span style={{ color: previewFg, opacity: 0.7 }}>❯</span>
                  {' '}
                  <span style={{ color: previewFg }}>git push</span>
                </div>
                <div>
                  <span style={{ color: previewGreen }}>✓</span>
                  {' '}
                  <span style={{ color: previewFg, opacity: 0.5 }}>pushed to origin/main</span>
                </div>
                <div>
                  <span style={{ color: previewFg, opacity: 0.5 }}>~/projects</span>
                  {' '}
                  <span style={{ color: previewFg, opacity: 0.7 }}>❯</span>
                  {' '}
                  <span style={{ color: previewYellow }}>fock</span>
                </div>
                <div>
                  <span style={{ color: previewFg, opacity: 0.4 }}>→ sudo git push</span>
                </div>
                <div>
                  <span style={{ color: previewFg, opacity: 0.5 }}>~/projects</span>
                  {' '}
                  <span style={{ color: previewFg, opacity: 0.7 }}>❯</span>
                  {' '}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: `${editor.theme.font_size ?? 14}px`,
                      background: previewCursor,
                      verticalAlign: 'middle',
                      animation: 'sf-cursor-blink 1s step-end infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-sf-b1 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              <Check size={14} />
              {saving ? 'Saving…' : 'Save theme'}
            </button>
            <button type="button" onClick={closeEditor} className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ThemeCardProps {
  theme: Theme
  deleting: boolean
  onActivate: () => void
  onEdit: () => void
  onDelete: () => void
}

function ThemeCard({
  theme,
  deleting,
  onActivate,
  onEdit,
  onDelete,
}: ThemeCardProps) {
  const themeColors = theme.colors ?? {}

  return (
    <div className={`sf-card flex flex-col gap-4 ${theme.is_active ? 'border-sf-b2' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {theme.is_active && (
              <span className="badge badge-online shrink-0">Active</span>
            )}
            {theme.is_system && (
              <span className="badge badge-syncing shrink-0">System</span>
            )}
            <span className="sf-display text-lg truncate">{theme.name}</span>
          </div>
          <span className="text-[10px] text-sf-hint font-mono tracking-wide">
            {theme.font_family} · {theme.font_size}px
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(themeColors).slice(0, 10).map(([key, val]) => (
          <div
            key={key}
            className="w-5 h-5 rounded-sm border border-sf-b1"
            style={{ background: val }}
            title={`${key}: ${val}`}
          />
        ))}
        {Object.keys(themeColors).length > 10 && (
          <span className="text-[10px] text-sf-hint self-center">
            +{Object.keys(themeColors).length - 10}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-sf-b1">
        {!theme.is_active && (
          <button
            type="button"
            onClick={onActivate}
            className="btn-secondary text-xs flex-1 justify-center"
          >
            <ChevronRight size={12} /> Activate
          </button>
        )}
        {!theme.is_system && (
          <button type="button" onClick={onEdit} className="btn-ghost text-xs">
            <Pencil size={12} /> Edit
          </button>
        )}
        {!theme.is_active && !theme.is_system && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="btn-danger text-xs"
          >
            <Trash2 size={12} />
            {deleting ? '…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}
