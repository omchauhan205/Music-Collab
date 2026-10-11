import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notificationApi } from '../api/endpoints'
import { useToast } from '../context/ToastContext'
import { Badge, Button, Card, EmptyState, PageLoader } from '../components/ui'
import { extractErrorMessage, formatRelative } from '../utils/format'

export default function NotificationsPage() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    notificationApi
      .list()
      .then((res) => setItems(res.data))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const markRead = async (n) => {
    if (n.read) return
    try {
      await notificationApi.markRead(n.id)
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const markAll = async () => {
    try {
      await notificationApi.markAllRead()
      toast.success('All notifications marked as read')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notification center</h1>
          <p className="mt-1 text-sm text-slate-500">Project updates, feedback and file changes.</p>
        </div>
        {items.some((n) => !n.read) && (
          <Button variant="secondary" onClick={markAll}>
            Mark all read
          </Button>
        )}
      </div>

      <Card bodyClassName="p-0">
        {loading ? (
          <PageLoader label="Loading notifications..." />
        ) : items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No notifications" description="You're all caught up." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex items-start justify-between gap-4 px-5 py-4 ${n.read ? '' : 'bg-indigo-50/40'}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">{n.title}</p>
                    {n.type && <Badge color="gray">{n.type}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatRelative(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {n.link && (
                    <Link to={n.link} onClick={() => markRead(n)}>
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </Link>
                  )}
                  {!n.read && (
                    <Button size="sm" variant="ghost" onClick={() => markRead(n)}>
                      Mark read
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
