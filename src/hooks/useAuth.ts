'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, register, forgotPassword, saveTokens, saveUser } from '@/lib/auth'

export function useLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function submit(email: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await login(email, password)
      saveTokens(res.access_token, res.refresh_token)
      saveUser(res.user)
      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}

export function useRegister() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function submit(email: string, username: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await register(email, username, password)
      saveTokens(res.access_token, res.refresh_token)
      saveUser(res.user)
      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}

export function useForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [sent, setSent]       = useState(false)

  async function submit(email: string) {
    setLoading(true)
    setError(null)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error, sent }
}
