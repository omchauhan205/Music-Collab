import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { Button, Card, EmptyState, PageLoader, StatusBadge } from '../../components/ui'
import { extractErrorMessage, formatRelative } from '../../utils/format'

export default function AdminModeration() {
  const toast = useToast()
  const [tab, setTab] = useState('files')
  const [files, setFiles] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([adminApi.pendingFiles(), adminApi.pendingComments()])
      .then(([f, c]) => {
        setFiles(f.data)
        setComments(c.data)
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const decide = async (kind, id, status) => {
    setBusyId(`${kind}-${id}`)
    try {
      if (kind === 'file') {
        await adminApi.moderateFile(id, { status, note: status === 'REJECTED' ? 'Rejected by moderator' : null })
      } else {
        await adminApi.moderateComment(id, { status, note: null })
      }
      toast.success(`Content ${status.toLowerCase()} successfully`)
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const renderDecisionButtons = (kind, id) => (
    <div className="flex gap-2">
      <Button
        variant="success"
        size="sm"
        loading={busyId === `${kind}-${id}`}
        onClick={() => decide(kind, id, 'APPROVED')}
      >
        Approve
      </Button>
      <Button
        variant="danger"
        size="sm"
        loading={busyId === `${kind}-${id}`}
        onClick={() => decide(kind, id, 'REJECTED')}
      >
        Reject
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content moderation</h1>
          <p className="mt-1 text-sm text-slate-500">Review uploaded music files and comments.</p>
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('files')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'files' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Files ({files.length})
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'comments' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Comments ({comments.length})
        </button>
      </div>

      <Card bodyClassName="p-0">
        {loading ? (
          <PageLoader label="Loading moderation queue..." />
        ) : tab === 'files' ? (
          files.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No files pending review" description="All uploaded content has been reviewed." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {files.map((file) => (
                <li key={file.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{file.name}</p>
                      <StatusBadge status={file.moderationStatus} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{file.description || 'No description'}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      by {file.owner?.name} · {file.tags || 'no tags'} · uploaded {formatRelative(file.createdAt)}
                    </p>
                  </div>
                  {renderDecisionButtons('file', file.id)}
                </li>
              ))}
            </ul>
          )
        ) : comments.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No comments pending review" description="All comments have been reviewed." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {comments.map((comment) => (
              <li key={comment.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">“{comment.text}”</p>
                  <p className="mt-1 text-xs text-slate-400">
                    by {comment.author?.name} · {formatRelative(comment.createdAt)}
                  </p>
                </div>
                {renderDecisionButtons('comment', comment.id)}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
