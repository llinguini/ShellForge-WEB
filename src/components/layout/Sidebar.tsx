'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Palette, Terminal,
  Laptop, History, Settings, LogOut,
} from 'lucide-react'
import { useUser } from '@/components/providers/AuthProvider'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/themes',    label: 'Themes',    icon: Palette },
  { href: '/aliases',   label: 'Aliases',   icon: Terminal },
  { href: '/devices',   label: 'Devices',   icon: Laptop },
  { href: '/history',   label: 'History',   icon: History },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useUser()

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : '??'

  return (
    <aside className="w-52 h-screen bg-sf-s1 border-r border-sf-b1 flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-sf-b1">
        <span className="sf-display text-lg">
          <span className="not-italic font-bold">Shell</span>Forge
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname.startsWith(href) ? 'active' : ''}`}
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}

        <div className="my-2 border-t border-sf-b1" />

        <Link
          href="/settings"
          className={`nav-item ${pathname.startsWith('/settings') ? 'active' : ''}`}
        >
          <Settings size={14} />
          Settings
        </Link>
      </nav>

      <div className="px-3 pb-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2 py-2 rounded-sm bg-sf-s2">
          <div className="w-6 h-6 rounded-full bg-sf-b2 flex items-center justify-center text-[9px] text-sf-muted font-semibold shrink-0">
            {initials}
          </div>
          <span className="text-[10px] text-sf-hint truncate tracking-wide flex-1">
            {user?.email ?? '…'}
          </span>
          <button
            type="button"
            onClick={logout}
            className="text-sf-hint hover:text-sf-red transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  )
}
