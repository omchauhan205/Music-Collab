import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fileApi, projectApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageLoader,
  Select,
  StatusBadge,
  Textarea,
} from '../../components/ui'
import { extractErrorMessage, formatDate, formatRelative, initials } from '../../utils/format'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [addingMember, setAddingMember] = useState(false)

  const isOwner = project && user && project.owner?.id === user.id
  const canManage = isOwner || user?.role === 'ADMIN'

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([projectApi.get(id), fileApi.list()])
      .then(([p, f]) => {
        setProject(p.data)
        setFiles(f.data.filter((file) => file.projectId === Number(id)))
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, toast])

  useEffect(() => {
    load()
  }, [load])

  const openEdit = () => {
    setForm({
      title: project.title,
      description: project.description || '',
      genre: project.genre || '',
      deadline: project.deadline || '',
      status: project.status,
    })
    setEditOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await projectApi.update(id, form)
      toast.success('Project updated successfully')
      setEditOpen(false)
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setAddingMember(true)
    try {
      await projectApi.addMember(id, memberEmail)
      toast.success('Collaborator added')
      setMemberEmail('')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.user.name} from this project?`)) return
    try {
      await projectApi.removeMember(id, member.user.id)
      toast.success('Collaborator removed')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    try {
      await projectApi.remove(id)
      toast.success('Project deleted')
      navigate('/musician/projects')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading project..." />
  if (!project) return <EmptyState title="Project not found" action={<Link to="/musician/projects">Back to projects</Link>} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/musician/projects" className="text-sm text-indigo-600 hover:underline">
          ← Back to projects
        </Link>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={openEdit}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Owned by {project.owner?.name} · created {formatRelative(project.createdAt)}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-4 text-sm text-slate-600">{project.description || 'No description provided.'}</p>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Genre</dt>
            <dd className="mt-0.5 text-slate-700">{project.genre || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Deadline</dt>
            <dd className="mt-0.5 text-slate-700">{formatDate(project.deadline)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Last updated</dt>
            <dd className="mt-0.5 text-slate-700">{formatRelative(project.updatedAt)}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={`Collaborators (${project.members?.length || 0})`} className="lg:col-span-1">
          <ul className="space-y-3">
            {project.members?.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                    {initials(member.user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{member.user.name}</p>
                    <p className="truncate text-xs text-slate-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={member.role === 'OWNER' ? 'indigo' : 'gray'}>{member.role}</Badge>
                  {canManage && member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {canManage && (
            <form className="mt-5 border-t border-slate-100 pt-4" onSubmit={handleAddMember}>
              <Field label="Add collaborator by email">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="musician@example.com"
                    required
                  />
                  <Button type="submit" loading={addingMember}>
                    Add
                  </Button>
                </div>
              </Field>
            </form>
          )}
        </Card>

        <Card title={`Project files (${files.length})`} className="lg:col-span-2">
          {files.length === 0 ? (
            <EmptyState
              title="No files in this project"
              description="Upload a music file and assign it to this project."
              action={
                <Link to="/musician/files">
                  <Button size="sm">Go to music files</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {files.map((file) => (
                <li key={file.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link to={`/musician/files/${file.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                      {file.name}
                    </Link>
                    <p className="text-xs text-slate-400">
                      by {file.owner?.name} · v{file.currentVersion} · {formatRelative(file.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={file.moderationStatus} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit project"
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
            <Field label="Title" required>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Genre">
                <Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
              </Field>
              <Field label="Deadline">
                <Input
                  type="date"
                  value={form.deadline || ''}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
          </form>
        )}
      </Modal>
    </div>
  )
}
