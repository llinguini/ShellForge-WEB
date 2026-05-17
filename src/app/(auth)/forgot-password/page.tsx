'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useForgotPassword } from '@/hooks/useAuth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { submit, loading, error, sent } = useForgotPassword()

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center">
        <CheckCircle size={32} className="text-sf-green" />
        <h1 className="sf-display text-xl mt-4">Check your inbox</h1>
        <p className="text-sf-dim text-sm mt-2">
          If that email exists, you&apos;ll receive a reset link shortly.
        </p>
        <Link
          href="/login"
          className="text-sf-hint text-xs mt-6 tracking-wide hover:text-sf-muted transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="sf-display text-2xl">Reset your password</h1>
      <p className="text-sf-dim text-sm mt-1">
        Enter your email and we&apos;ll send you a link
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(email)
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

        <button
          type="submit"
          className="btn-primary w-full justify-center mt-2"
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-sf-hint text-xs text-center mt-6 tracking-wide">
        <Link href="/login" className="text-sf-muted hover:text-sf-text transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
