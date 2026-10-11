import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationApi } from '../api/endpoints'

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { to: '/admin/users', label: 'User Management', icon: '👥' },
  { to: '/admin/moderation', label: 'Content Moderation', icon: '✔' },
  { to: '/admin/settings', label: 'System Settings', icon: '⚙' },
  { to: '/admin/activity', label: 'Activity Monitor', icon: '📈' },
]

const musicianNav = [
  { to: '/musician', label: 'Dashboard', icon: '▦', end: true },
  { to: '/musician/projects', label: 'Projects', icon: '🎼' },
  { to: '/musician/files', label: 'Music Files', icon: '🎵' },
  { to: '/musician/portfolio', label: 'My Portfolio', icon: '💼' },
]

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  const navItems = isAdmin ? adminNav : musicianNav

  const loadUnread = useCallback(() => {
    notificationApi
      .unreadCount()
      .then((res) => setUnread(res.data.count || 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadUnread()
    const interval = window.setInterval(loadUnread, 30000)
    return () => window.clearInterval(interval)
  }, [loadUnread])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
          <img src="/music.svg" alt="MusicCollab" className="h-7 w-7" />
          <span className="text-lg font-bold text-slate-900">MusicCollab</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div className="my-2 border-t border-slate-100" />
          <NavLink
            to="/notifications"
            onClick={() => setMobileNav(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <span className="w-5 text-center">🔔</span>
            Notifications
            {unread > 0 && (
              <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                {unread}
              </span>
            )}
          </NavLink>
        </nav>
        <div className="absolute bottom-0 w-full border-t border-slate-100 p-3">
          <p className="px-2 text-xs text-slate-400">
            Signed in as <span className="font-medium text-slate-600">{user?.role}</span>
          </p>
        </div>
      </aside>

      {mobileNav && (
        <div className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={() => setMobileNav(false)} />
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setMobileNav((v) => !v)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <div className="hidden text-sm text-slate-500 lg:block">
            Online Music Collaboration Platform
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              🔔
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium text-slate-700 sm:block">{user?.name}</span>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-slate-100 px-4 py-2">
                    <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
