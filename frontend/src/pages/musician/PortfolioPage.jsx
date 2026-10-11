import { useEffect, useState } from 'react'
import { fileApi, portfolioApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageLoader, Select, Textarea } from '../../components/ui'
import { extractErrorMessage, formatDate } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'

const emptyForm = { title: '', type: 'SONG', description: '', releaseDate: '', coverImageUrl: '', musicFileId: '' }

export default function PortfolioPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([portfolioApi.list(), fileApi.list()])
      .then(([p, f]) => {
        setItems(p.data)
        setFiles(f.data.filter((file) => file.owner?.id === user.id))
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      title: item.title,
      type: item.type,
      description: item.description || '',
      releaseDate: item.releaseDate || '',
      coverImageUrl: item.coverImageUrl || '',
      musicFileId: item.musicFileId || '',
    })
    setError('')
    setModalOpen(true)
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      musicFileId: form.musicFileId ? Number(form.musicFileId) : null,
      releaseDate: form.releaseDate || null,
      coverImageUrl: form.coverImageUrl || null,
    }
    try {
      if (editing) {
        await portfolioApi.update(editing.id, payload)
        toast.success('Portfolio item updated')
      } else {
        await portfolioApi.create(payload)
        toast.success('Portfolio item added')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}" from your portfolio?`)) return
    try {
      await portfolioApi.remove(item.id)
      toast.success('Portfolio item deleted')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My portfolio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Showcase your songs and albums. Public link:{' '}
            <a href={`/portfolio/${user.id}`} className="text-indigo-600 hover:underline">
              /portfolio/{user.id}
            </a>
          </p>
        </div>
        <Button onClick={openCreate}>+ Add item</Button>
      </div>

      {loading ? (
        <PageLoader label="Loading portfolio..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your portfolio is empty"
          description="Add your songs and albums to build your music profile."
          action={<Button onClick={openCreate}>Add your first item</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <Badge color={item.type === 'ALBUM' ? 'indigo' : 'blue'}>{item.type}</Badge>
              </div>
              <p className="mt-2 flex-1 text-sm text-slate-500">{item.description || 'No description'}</p>
              <dl className="mt-3 space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <dt>Released</dt>
                  <dd>{formatDate(item.releaseDate)}</dd>
                </div>
                {item.musicFileName && (
                  <div className="flex justify-between">
                    <dt>Linked file</dt>
                    <dd className="truncate">{item.musicFileName}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(item)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit portfolio item' : 'Add portfolio item'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save changes' : 'Add item'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <Field label="Title" required>
            <Input name="title" value={form.title} onChange={handleChange} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" required>
              <Select name="type" value={form.type} onChange={handleChange}>
                <option value="SONG">Song</option>
                <option value="ALBUM">Album</option>
              </Select>
            </Field>
            <Field label="Release date">
              <Input type="date" name="releaseDate" value={form.releaseDate} onChange={handleChange} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea name="description" value={form.description} onChange={handleChange} />
          </Field>
          <Field label="Cover image URL">
            <Input name="coverImageUrl" value={form.coverImageUrl} onChange={handleChange} placeholder="https://..." />
          </Field>
          <Field label="Link a music file" hint="Optional — connect this item to one of your uploads">
            <Select name="musicFileId" value={form.musicFileId} onChange={handleChange}>
              <option value="">None</option>
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  )
}
