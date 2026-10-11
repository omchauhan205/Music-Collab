import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../api/endpoints'
import { Card, EmptyState, PageLoader, StatCard, StatusBadge } from '../../components/ui'
import { formatRelative } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .admin()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading dashboard..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.name}. Here is the platform overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} hint={`${stats.totalMusicians} musicians`} />
        <StatCard label="Projects" value={stats.totalProjects} accent="blue" />
        <StatCard label="Music files" value={stats.totalMusicFiles} accent="indigo" />
        <StatCard
          label="Pending moderation"
          value={stats.pendingModeration}
          accent="amber"
          hint="Files and comments awaiting review"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Approved content" value={stats.approvedContent} accent="green" />
        <StatCard label="Rejected content" value={stats.rejectedContent} accent="red" />
        <StatCard label="Unread notifications" value={stats.unreadNotifications} accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Recent activity"
          subtitle="Latest user and system events"
          className="lg:col-span-2"
          actions={
            <Link to="/admin/activity" className="text-sm font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          }
        >
          {stats.recentActivity?.length ? (
            <ul className="divide-y divide-slate-100">
              {stats.recentActivity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-800">
                      <span className="font-medium">{a.user?.name || 'System'}</span>{' '}
                      <span className="text-slate-500">{a.action.toLowerCase().replaceAll('_', ' ')}</span>{' '}
                      {a.details && <span className="text-slate-400">· {a.details}</span>}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-slate-400">{formatRelative(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No activity yet" description="Platform activity will appear here." />
          )}
        </Card>

        <Card title="Content status" subtitle="Music files by moderation state">
          <div className="space-y-3">
            {Object.entries(stats.filesByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm font-semibold text-slate-700">{count}</span>
              </div>
            ))}
            <Link
              to="/admin/moderation"
              className="mt-2 block rounded-lg bg-indigo-50 px-3 py-2 text-center text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              Go to moderation queue
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
