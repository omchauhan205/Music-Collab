import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiAssetUrl } from '../../api/client'
import { fileApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageLoader,
  StatusBadge,
  Textarea,
} from '../../components/ui'
import { extractErrorMessage, formatBytes, formatDateTime, formatRelative, initials } from '../../utils/format'

export default function FileDetailPage() {
  const { id } = useParams()
  const toast = useToast()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [versionFile, setVersionFile] = useState(null)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [comment, setComment] = useState('')
  const [commenting, setCommenting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fileApi
      .get(id)
      .then((res) => setFile(res.data))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, toast])

  useEffect(() => {
    load()
  }, [load])

  const openEdit = () => {
    setForm({ name: file.name, description: file.description || '', tags: file.tags || '' })
    setEditOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fileApi.update(id, { ...form, projectId: file.projectId })
      toast.success('File updated successfully')
      setEditOpen(false)
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleNewVersion = async (e) => {
    e.preventDefault()
    if (!versionFile) {
      toast.error('Please choose a file for the new version')
      return
    }
    setUploading(true)
    const data = new FormData()
    data.append('file', versionFile)
    if (notes) data.append('notes', notes)
    try {
      await fileApi.addVersion(id, data)
      toast.success('New version uploaded successfully')
      setVersionFile(null)
      setNotes('')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setCommenting(true)
    try {
      await fileApi.addComment(id, comment.trim())
      toast.success('Comment added — pending moderation')
      setComment('')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setCommenting(false)
    }
  }

  if (loading) return <PageLoader label="Loading music file..." />
  if (!file) return <EmptyState title="Music file not found" action={<Link to="/musician/files">Back to files</Link>} />

  const latest = file.latestVersion
  const audioUrl = latest ? apiAssetUrl(latest.downloadUrl) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/musician/files" className="text-sm text-indigo-600 hover:underline">
          ← Back to files
        </Link>
        <Button variant="secondary" size="sm" onClick={openEdit}>
          Edit details
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{file.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Uploaded by {file.owner?.name} · v{file.currentVersion} · {formatRelative(file.updatedAt)}
            </p>
          </div>
          <StatusBadge status={file.moderationStatus} />
        </div>

        {file.moderationStatus === 'REJECTED' && file.moderationNote && (
          <div className="mt-4">
            <Alert type="error">Rejected: {file.moderationNote}</Alert>
          </div>
        )}

        {file.description && <p className="mt-4 text-sm text-slate-600">{file.description}</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {file.projectTitle && <Badge color="blue">Project: {file.projectTitle}</Badge>}
          {file.tags &&
            file.tags.split(',').map((t) => (
              <Badge key={t} color="gray">
                {t.trim()}
              </Badge>
            ))}
        </div>

        {audioUrl && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Latest version preview
            </p>
            <audio className="audio-player" controls src={audioUrl}>
              Your browser does not support audio playback.
            </audio>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={`Version history (${file.versions?.length || 0})`} className="lg:col-span-2">
          <ul className="divide-y divide-slate-100">
            {file.versions?.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge color="indigo">v{v.versionNumber}</Badge>
                    <span className="text-sm font-medium text-slate-800">{v.originalFilename}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatBytes(v.sizeBytes)} · uploaded by {v.uploadedBy?.name} · {formatDateTime(v.createdAt)}
                  </p>
                  {v.notes && <p className="mt-1 text-xs text-slate-500">“{v.notes}”</p>}
                </div>
                <a
                  href={apiAssetUrl(v.downloadUrl)}
                  download={v.originalFilename}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>

          <form className="mt-5 space-y-3 border-t border-slate-100 pt-4" onSubmit={handleNewVersion}>
            <p className="text-sm font-semibold text-slate-800">Upload a new version</p>
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a"
              onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <Textarea
              placeholder="Describe the changes in this version (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <Button type="submit" loading={uploading}>
              Upload version
            </Button>
          </form>
        </Card>

        <Card title={`Comments (${file.comments?.length || 0})`}>
          <div className="max-h-80 space-y-4 overflow-y-auto">
            {file.comments?.length === 0 && <p className="text-sm text-slate-400">No comments yet.</p>}
            {file.comments?.map((c) => (
              <div key={c.id} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                  {initials(c.author?.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{c.author?.name}</p>
                    {c.moderationStatus !== 'APPROVED' && <StatusBadge status={c.moderationStatus} />}
                  </div>
                  <p className="text-sm text-slate-600">{c.text}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatRelative(c.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="mt-4 space-y-2 border-t border-slate-100 pt-4" onSubmit={handleComment}>
            <Textarea
              placeholder="Add a comment or review notes..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
            <Button type="submit" loading={commenting} disabled={!comment.trim()}>
              Post comment
            </Button>
          </form>
        </Card>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit file details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={saving}>
              Save changes
            </Button>
          </>
        }
      >
        {form && (
          <form className="space-y-4" onSubmit={handleEdit}>
            <Field label="Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </Field>
          </form>
        )}
      </Modal>
    </div>
  )
}
