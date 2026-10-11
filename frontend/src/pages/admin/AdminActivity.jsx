import { useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { Badge, Card, EmptyState, PageLoader } from '../../components/ui'
import { extractErrorMessage, formatDateTime } from '../../utils/format'

export default function AdminActivity() {
  const toast = useToast()
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .activity()
      .then((res) => setActivity(res.data))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [toast])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity monitoring</h1>
        <p className="mt-1 text-sm text-slate-500">Real-time log of user activities and system events.</p>
      </div>

      <Card bodyClassName="p-0">
        {loading ? (
          <PageLoader label="Loading activity..." />
        ) : activity.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No activity recorded yet" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activity.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{a.user?.name || 'System'}</td>
                    <td className="px-5 py-3">
                      <Badge color="indigo">{a.action}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {a.entityType}
                      {a.entityId ? ` #${a.entityId}` : ''}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{a.details || '—'}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">{formatDateTime(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
