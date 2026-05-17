import { apiFetch } from './api'
import type { User } from '@/types'

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export async function register(
  email: string,
  username: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/v1/auth/register', {
    method: 'POST',
    body: { email, username, password },
  })
}

export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/v1/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('sf_token', accessToken)
  localStorage.setItem('sf_refresh', refreshToken)
  document.cookie = `sf_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function getToken(): string | null {
  return localStorage.getItem('sf_token')
}

export function clearTokens() {
  localStorage.removeItem('sf_token')
  localStorage.removeItem('sf_refresh')
  document.cookie = 'sf_token=; path=/; max-age=0'
}

export function saveUser(user: User) {
  localStorage.setItem('sf_user', JSON.stringify(user))
}
