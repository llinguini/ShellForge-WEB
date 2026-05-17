'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRegister } from '@/hooks/useAuth'

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const { submit, loading, error } = useRegister()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return
    submit(email, username, password)
  }

  const mismatch = confirm.length > 0 && password !== confirm

  return (
    <div>
      <h1 className="sf-display text-2xl">Create your account</h1>
      <p className="text-sf-dim text-sm mt-1">Start syncing your terminal</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">

        {error && (
          <div className="bg-sf-red-d border border-sf-red/20 text-sf-red text-sm p-3 rounded-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="sf-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Username</label>
          <input
            type="text"
            placeholder="yourhandle"
            className="sf-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Password</label>
          <input
            type="password"
            placeholder="············"
            className="sf-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sf-label">Confirm password</label>
          <input
            type="password"
            placeholder="············"
            className={`sf-input ${mismatch ? 'border-sf-red/50' : ''}`}
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

        <button
          type="submit"
          className="btn-primary w-full justify-center mt-2"
          disabled={loading || mismatch}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sf-hint text-xs text-center mt-6 tracking-wide">
        Already have an account?{' '}
        <Link href="/login" className="text-sf-muted hover:text-sf-text transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
