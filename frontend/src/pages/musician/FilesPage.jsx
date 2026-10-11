import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fileApi, projectApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { Button, Card, EmptyState, Field, Input, Modal, PageLoader, Select, StatusBadge, Textarea } from '../../components/ui'
import { extractErrorMessage, formatBytes, formatRelative } from '../../utils/format'

const emptyForm = { name: '', description: '', tags: '', projectId: '' }

export default function FilesPage() {
  const toast = useToast()
  const [files, setFiles] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([fileApi.list(), projectApi.list()])
      .then(([f, p]) => {
        setFiles(f.data)
        setProjects(p.data)
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please choose a music file to upload')
      return
    }
    setSaving(true)
    setError('')
    const data = new FormData()
    data.append('name', form.name)
    if (form.description) data.append('description', form.description)
    if (form.tags) data.append('tags', form.tags)
    if (form.projectId) data.append('projectId', form.projectId)
    data.append('file', file)
    try {
      await fileApi.upload(data, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      toast.success('Music file uploaded successfully')
      setModalOpen(false)
      setForm(emptyForm)
      setFile(null)
      setProgress(0)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (f) => {
    if (!window.confirm(`Delete "${f.name}"? This removes all versions.`)) return
    try {
      await fileApi.remove(f.id)
      toast.success('Music file deleted')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Music files</h1>
          <p className="mt-1 text-sm text-slate-500">Upload, share and iterate on your tracks.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Upload music</Button>
      </div>

      <Card bodyClassName="p-0">
        {loading ? (
          <PageLoader label="Loading music files..." />
        ) : files.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No music files yet"
              description="Upload your first track to start sharing and collaborating."
              action={<Button onClick={() => setModalOpen(true)}>Upload music</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link to={`/musician/files/${f.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                        {f.name}
                      </Link>
                      <p className="text-xs text-slate-400">{f.tags || 'no tags'}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{f.projectTitle || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">v{f.currentVersion}</td>
                    <td className="px-5 py-3 text-slate-600">{formatBytes(f.latestVersion?.sizeBytes)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={f.moderationStatus} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">{formatRelative(f.updatedAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/musician/files/${f.id}`}>
                          <Button variant="secondary" size="sm">
                            Open
                          </Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(f)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload music file"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              Upload
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <Field label="Name" required>
            <Input name="name" value={form.name} onChange={handleChange} required minLength={2} />
          </Field>
          <Field label="Description">
            <Textarea name="description" value={form.description} onChange={handleChange} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tags" hint="Comma separated">
              <Input name="tags" value={form.tags} onChange={handleChange} placeholder="vocals, demo" />
            </Field>
            <Field label="Project">
              <Select name="projectId" value={form.projectId} onChange={handleChange}>
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Music file" required hint="MP3, WAV, FLAC, etc. (max 50MB)">
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </Field>
          {saving && progress > 0 && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
