'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, clearTokens } from '@/lib/auth'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  logout: () => void
  refreshUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  logout: () => {},
  refreshUser: () => {},
})

export function useUser() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router  = useRouter()
  const [user, setUser]       = useState<User | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = getToken()
    if (!t) {
      router.replace('/login')
      setLoading(false)
      return
    }

    const stored = localStorage.getItem('sf_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        // ignore parse error
      }
    }

    setToken(t)
    setLoading(false)
  }, [router])

  function logout() {
    clearTokens()
    localStorage.removeItem('sf_user')
    router.replace('/login')
  }

  function refreshUser(updated: User) {
    setUser(updated)
    localStorage.setItem('sf_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, refreshUser }}>
      {loading ? <AppLoadingScreen /> : children}
    </AuthContext.Provider>
  )
}

function AppLoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-sf-bg">
      <span className="sf-display text-2xl text-sf-hint">
        <span className="not-italic font-bold">Shell</span>Forge
      </span>
    </div>
  )
}
