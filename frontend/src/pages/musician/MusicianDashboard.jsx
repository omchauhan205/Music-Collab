import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../api/endpoints'
import { Card, EmptyState, PageLoader, StatCard, StatusBadge } from '../../components/ui'
import { formatRelative } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'

export default function MusicianDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .musician()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading your dashboard..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Your collaboration workspace at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={stats.totalProjects} accent="blue" />
        <StatCard label="Music files" value={stats.totalMusicFiles} accent="indigo" />
        <StatCard label="Awaiting approval" value={stats.pendingModeration} accent="amber" />
        <StatCard label="Unread notifications" value={stats.unreadNotifications} accent="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Your recent activity"
          subtitle="Latest actions in your workspace"
          className="lg:col-span-2"
        >
          {stats.recentActivity?.length ? (
            <ul className="divide-y divide-slate-100">
              {stats.recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{a.action.toLowerCase().replaceAll('_', ' ')}</span>
                    {a.details && <span className="text-slate-400"> · {a.details}</span>}
                  </p>
                  <span className="whitespace-nowrap text-xs text-slate-400">{formatRelative(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No activity yet"
              description="Create a project or upload a track to get started."
            />
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Content status" subtitle="Your uploaded files">
            <div className="space-y-3">
              {Object.entries(stats.filesByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-sm font-semibold text-slate-700">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick actions">
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/musician/projects" className="rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100">
                🎼 Manage projects
              </Link>
              <Link to="/musician/files" className="rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100">
                🎵 Upload / share music
              </Link>
              <Link to="/musician/portfolio" className="rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100">
                💼 Update portfolio
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
