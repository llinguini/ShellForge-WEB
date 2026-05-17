'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLogin } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { submit, loading, error } = useLogin()

  return (
    <div>
      <h1 className="sf-display text-2xl">Welcome back</h1>
      <p className="text-sf-dim text-sm mt-1">Sign in to your account</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(email, password)
        }}
        className="mt-8 flex flex-col gap-4"
      >
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
          <div className="flex items-center justify-between">
            <label className="sf-label">Password</label>
            <Link
              href="/forgot-password"
              className="text-[10px] text-sf-hint hover:text-sf-muted transition-colors tracking-wide"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="············"
            className="sf-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full justify-center mt-2"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sf-hint text-xs text-center mt-6 tracking-wide">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-sf-muted hover:text-sf-text transition-colors">
          Register
        </Link>
      </p>
    </div>
  )
}
