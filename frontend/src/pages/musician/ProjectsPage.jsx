import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { Button, Card, EmptyState, Field, Input, Modal, PageLoader, Select, StatusBadge, Textarea } from '../../components/ui'
import { extractErrorMessage, formatDate } from '../../utils/format'

const emptyForm = { title: '', description: '', genre: '', deadline: '', status: 'OPEN' }

export default function ProjectsPage() {
  const toast = useToast()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    projectApi
      .list()
      .then((res) => setProjects(res.data))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await projectApi.create(form)
      toast.success('Project created successfully')
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Collaborate on music with your team.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New project</Button>
      </div>

      {loading ? (
        <PageLoader label="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first collaborative project to get started."
          action={<Button onClick={() => setModalOpen(true)}>Create project</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/musician/projects/${project.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description || 'No description'}</p>
                <dl className="mt-4 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <dt>Owner</dt>
                    <dd className="font-medium text-slate-700">{project.owner?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Collaborators</dt>
                    <dd>{project.members?.length || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Files</dt>
                    <dd>{project.fileCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Deadline</dt>
                    <dd>{formatDate(project.deadline)}</dd>
                  </div>
                </dl>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              Create project
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <Field label="Title" required>
            <Input name="title" value={form.title} onChange={handleChange} required minLength={2} />
          </Field>
          <Field label="Description">
            <Textarea name="description" value={form.description} onChange={handleChange} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Genre">
              <Input name="genre" value={form.genre} onChange={handleChange} placeholder="e.g. Indie rock" />
            </Field>
            <Field label="Deadline">
              <Input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
            </Field>
          </div>
          <Field label="Status">
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  )
}
