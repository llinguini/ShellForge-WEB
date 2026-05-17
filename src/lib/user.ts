import { apiFetch } from './api'
import type { User } from '@/types'

export async function getMe(token: string): Promise<User> {
  const res = await apiFetch<{ user: User }>('/v1/user/me', { token })
  return res.user
}

export async function updateProfile(
  token: string,
  data: { display_name?: string; avatar_url?: string; bio?: string },
): Promise<User> {
  const res = await apiFetch<{ user: User }>('/v1/user/me', {
    method: 'PATCH',
    token,
    body: data,
  })
  return res.user
}

export async function updateUsername(
  token: string,
  username: string,
): Promise<User> {
  const res = await apiFetch<{ user: User }>('/v1/user/me/username', {
    method: 'PATCH',
    token,
    body: { username },
  })
  return res.user
}

export async function updateEmail(
  token: string,
  email: string,
  password: string,
): Promise<User> {
  const res = await apiFetch<{ user: User }>('/v1/user/me/email', {
    method: 'PATCH',
    token,
    body: { email, password },
  })
  return res.user
}

export async function updatePassword(
  token: string,
  current_password: string,
  new_password: string,
): Promise<void> {
  await apiFetch<{ message: string }>('/v1/user/me/password', {
    method: 'PATCH',
    token,
    body: { current_password, new_password },
  })
}

export async function deleteAccount(
  token: string,
  password: string,
): Promise<void> {
  await apiFetch<{ message: string }>('/v1/user/me', {
    method: 'DELETE',
    token,
    body: { password },
  })
}
