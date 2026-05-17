# ShellForge Web — Project Knowledge

## Overview
Next.js 15 dashboard for ShellForge terminal config sync. API: `api.shellforge.dev`.
Deploy target: `app.shellforge.dev`. No remote sessions — config only.

## Node.js
- Use **Node 20** via nvm: `nvm use` (`.nvmrc` present) or:
  `export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"`
- Cursor's bundled Node (v22) overrides `nvm use` in sandboxed shells unless PATH is set explicitly.

## Stack
- Next.js 15 App Router, TypeScript strict, Tailwind CSS v4
- shadcn/ui v4 (`components.json`, `src/components/ui/`)
- Design tokens: `src/lib/tokens.ts`, Tailwind `sf-*` in `tailwind.config.ts`

## Tailwind v4 + legacy globals
`globals.css` uses `@import "tailwindcss"` + `@config "../../tailwind.config.ts"` instead of
`@tailwind base/components/utilities` so `tailwind.config.ts` and `@apply bg-sf-*` work in v4.
All `@layer` rules match the original spec.

## Route groups
- `(auth)`: login, register, forgot-password — centered layout, no sidebar
- `(app)`: dashboard, themes, aliases, devices, history, settings — sidebar layout
- `/` redirects to `/dashboard`

## API client
`src/lib/api.ts` — `apiFetch`, base URL from `NEXT_PUBLIC_API_URL`.

## Auth
- `src/lib/auth.ts`: login, register, forgot-password + token helpers (`sf_token`, `sf_refresh` in localStorage)
- `src/hooks/useAuth.ts`: `useLogin`, `useRegister`, `useForgotPassword`
- Endpoints (no JWT): `POST /v1/auth/register` (email, username≥3, password≥8),
  `login`, `refresh` (body: `refresh_token`), `logout` (body: `refresh_token`)
- Response fields: `access_token`, `refresh_token`, `user` (not `token`)
- Stored as `sf_token` / `sf_refresh` in localStorage + cookie `sf_token`
- `forgot-password` UI exists; endpoint may not be on API yet

## Profile / Dashboard
- `GET /v1/profile` → `FullProfile` (active_theme, aliases, commands, tabs, sync)
- `src/lib/profile.ts` — CRUD helpers for themes, aliases, commands, sync
- Dashboard loads profile via `useUser().token`; no devices in profile payload yet

## User account (`src/lib/user.ts`)
- `GET/PATCH /v1/user/me` — profile fields (`display_name`, `avatar_url`, `bio`)
- `PATCH /v1/user/me/username`, `/email` (needs password), `/password`
- `DELETE /v1/user/me` — body `{ password }`
- Responses wrap `{ user: User }` except password/delete → `{ message }`
- `AuthProvider.refreshUser(user)` updates state + `sf_user` after successful PATCHes
- No `GET /v1/auth/me`; user loaded from `sf_user` at login/register

## Settings / History
- Settings page: profile, username, email, password, sync toggles, danger zone (sign out + delete)
- Sync: `GET/PATCH /v1/profile/sync` via `getSyncSettings` / `updateSyncSettings` + `normalizeSync`
- Sign out: `POST /v1/auth/logout` with refresh token, then `logout()`
- History: `GET /v1/history` with query params, `DELETE /v1/history` clears all
- History UI hidden when `sync_history` is false (banner links to /settings)

## Auth / apiFetch
- On 401: `POST /v1/auth/refresh` via raw `fetch` (not `apiFetch`), retry once, else `window.location.href = '/login'`
- `refreshToken()` removed from `auth.ts` — refresh is internal to `api.ts`
- Success redirects to `/dashboard`
- Token in `localStorage` + cookie `sf_token` (7d, SameSite=Lax) for edge middleware
- `src/middleware.ts`: protects `/(app)` routes; auth routes redirect if logged in
- `AuthProvider` in `(app)/layout`: loads user from `sf_user`, `useUser()` for sidebar
- 401 refresh handled in `apiFetch`; failed refresh redirects to `/login`
- Sessions logged in before cookie sync need re-login once

## Conventions
- No `shadow-*`, no default Tailwind `rounded-lg` in app UI (only `rounded-sm` / `rounded-md`)
- Colors only via `sf-*` tokens
- Sidebar shows email + username initials; updates via `refreshUser` after settings saves

## shadcn
Init added `button.tsx` (base-nova style). App chrome uses custom `.btn-*` classes in `globals.css`.

## Docker
- `Dockerfile`: multi-stage, Node 20 Alpine, `output: 'standalone'` in `next.config.ts`
- `docker-compose.yml`: service `web` on port 3000 (override with `PORT`)
- Build-time: `NEXT_PUBLIC_API_URL` (build arg + env)
- `host.docker.internal` via `extra_hosts` for API on the host machine (Linux)
- Commands: `docker compose up --build` | `docker compose up -d`

## CI / GHCR (`.github/workflows/docker-publish.yml`)
- Trigger: push to `main` (and `workflow_dispatch`)
- Registry: `ghcr.io/<owner>/<repo>` (image name = repository name, lowercase by GHCR)
- Tags per run: `0.1.N` (patch auto-increment from existing GHCR `0.1.*` tags; first publish → `0.1.0`) + `latest`
- Repo variable (optional): `NEXT_PUBLIC_API_URL` — defaults to `https://api.shellforge.dev`
- Uses `GITHUB_TOKEN` with `packages: write`; link package visibility to the repo in GitHub Packages settings
- Pull: `docker pull ghcr.io/<owner>/shellforge-web:latest` (adjust owner/repo casing)
