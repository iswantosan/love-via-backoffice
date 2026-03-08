'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getToken, clearToken } from '@/lib/api'
import clsx from 'clsx'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MapPin,
  History,
  CreditCard,
  MessageSquare,
  Flag,
  Shield,
  Key,
  LogOut,
  ClipboardList,
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/masters/criteria', label: 'Data Master - Kriteria', icon: BookOpen },
  { href: '/masters/locations', label: 'Data Master - Tempat Meet', icon: MapPin },
  { href: '/activity-logs', label: 'History Log', icon: History },
  { href: '/transactions', label: 'Transaksi', icon: CreditCard },
  { href: '/reservations', label: 'Reservasi (Mail Merge)', icon: ClipboardList },
  { href: '/testimonials', label: 'Testimoni', icon: MessageSquare },
  { href: '/reports', label: 'Reports', icon: Flag },
  { href: '/admins', label: 'Admin', icon: Shield },
  { href: '/change-password', label: 'Ganti Password', icon: Key },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!getToken()) router.replace('/login')
  }, [router])

  const logout = () => {
    clearToken()
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="font-bold text-lg text-lovevia-blue">LoveVIA Backoffice</Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-lovevia-blue/10 text-lovevia-blue'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
    </div>
  )
}
