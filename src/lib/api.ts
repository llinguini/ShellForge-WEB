const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'RUNTIME_API_URL'

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
  _retry?: boolean
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, token, _retry = false }: RequestOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && !_retry) {
    const newToken = await attemptRefresh()

    if (newToken) {
      return apiFetch<T>(path, {
        method,
        body,
        token: newToken,
        _retry: true,
      })
    }

    redirectToLogin()
    throw new Error('Session expired')
  }

  if (res.status === 401) {
    redirectToLogin()
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  const text = await res.text()
  if (!text) {
    return undefined as unknown as T
  }

  return JSON.parse(text) as T
}

async function attemptRefresh(): Promise<string | null> {
  try {
    const refresh = localStorage.getItem('sf_refresh')
    if (!refresh) return null

    const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const accessToken: string = data.access_token
    const refreshToken: string = data.refresh_token

    localStorage.setItem('sf_token', accessToken)
    localStorage.setItem('sf_refresh', refreshToken)
    document.cookie = `sf_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

    return accessToken
  } catch {
    return null
  }
}

function redirectToLogin() {
  localStorage.removeItem('sf_token')
  localStorage.removeItem('sf_refresh')
  localStorage.removeItem('sf_user')
  document.cookie = 'sf_token=; path=/; max-age=0'

  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}
