# Changelog

All notable changes to this project will be documented in this file.

## [0.1.17] - 2026-05-17

### Added
- GitHub Actions workflow `docker-publish.yml`: build on push to `main`, push to GHCR with `latest` and auto-incrementing `0.1.x` tags

## [0.1.16] - 2026-05-17

### Added
- Full account settings: profile, username, email, password, delete account
- `src/lib/user.ts` for `/v1/user/me` endpoints
- `refreshUser` on `AuthProvider` to sync sidebar after profile updates

### Changed
- `User` type extended with `display_name`, `avatar_url`, `bio`
- Settings page split into six sections with independent save/error state

## [0.1.15] - 2026-05-17

### Changed
- Themes API: parse `{ themes: [] }`, `is_system` flag; system themes are read-only (activate only)

## [0.1.14] - 2026-05-17

### Added
- Automatic token refresh on 401 in `apiFetch`, with redirect to `/login` on failure

## [0.1.13] - 2026-05-17

### Fixed
- Map API profile fields: `theme`, `sync_settings`, `tab_config`, `sync_aliases`
- Dashboard and settings sync toggles reflect real API state

## [0.1.12] - 2026-05-17

### Fixed
- `apiFetch` no longer parses JSON on 204 / empty responses (DELETE alias, device, etc.)

## [0.1.11] - 2026-05-17

### Fixed
- Parse `GET /v1/profile/aliases` and `/commands` as `{ aliases }` / `{ commands }`

## [0.1.10] - 2026-05-17

### Fixed
- Parse `GET /v1/devices` response shape `{ devices: Device[] }`

## [0.1.9] - 2026-05-17

### Added
- Settings page: account info, sign out with API logout, sync toggles with save-on-change
- History page: search (debounced), device filter, pagination, clear with confirmation
- `src/lib/history.ts` for history API client

## [0.1.8] - 2026-05-17

### Added
- Devices page with list, revoke confirmation, and empty-state install instructions
- `src/lib/devices.ts` for `GET /v1/devices` and `DELETE /v1/devices/:id`

## [0.1.7] - 2026-05-17

### Added
- Aliases & commands page with tabs, inline CRUD, and upsert via profile API

## [0.1.6] - 2026-05-17

### Added
- Themes page: grid, side editor, color picker, terminal preview, activate/delete

## [0.1.5] - 2026-05-17

### Added
- Dashboard page with profile summary (`GET /v1/profile`)
- `src/lib/profile.ts` client for profile, themes, aliases, commands, and sync APIs

## [0.1.4] - 2026-05-17

### Changed
- Auth client aligned with Go API: `access_token`, register `username`, `POST /v1/auth/logout`
- Register form: username field and client validation (username ≥3, password ≥8)

## [0.1.3] - 2026-05-17

### Added
- Edge middleware for route protection (`sf_token` cookie)
- `AuthProvider` with `/v1/auth/me`, loading screen, and `useUser` hook
- Sidebar logout and live user email/initials
- `refreshToken()` helper in `auth.ts` (cookie + localStorage sync on save/clear)

## [0.1.2] - 2026-05-17

### Added
- Auth API helpers (`src/lib/auth.ts`) and hooks (`useLogin`, `useRegister`, `useForgotPassword`)
- Login, register, and forgot-password screens with form validation and error states

## [0.1.1] - 2026-05-17

### Added
- Docker multi-stage `Dockerfile` (Node 20 Alpine) and `docker-compose.yml`
- `.dockerignore` and `output: 'standalone'` in Next.js config

## [0.1.0] - 2026-05-17

### Added
- Initial Next.js 15 project scaffold with App Router and TypeScript
- ShellForge design system (`tokens.ts`, `tailwind.config.ts`, `globals.css`)
- Route groups: auth (login, register, forgot-password) and app (dashboard, themes, aliases, devices, history, settings)
- Sidebar navigation with Lucide icons and placeholder pages
- HTTP API client (`apiFetch`), shared types, and `cn()` utility
- shadcn/ui initialization with base Button component
- `.env.local.example` for API URL configuration
