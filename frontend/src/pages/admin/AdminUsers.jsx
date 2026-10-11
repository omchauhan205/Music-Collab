import { useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageLoader, Select, Textarea } from '../../components/ui'
import { extractErrorMessage, formatDate } from '../../utils/format'

const emptyForm = { name: '', email: '', password: '', role: 'MUSICIAN', enabled: true, bio: '' }

export default function AdminUsers() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    adminApi
      .users()
      .then((res) => setUsers(res.data))
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

  const openEdit = (user) => {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      enabled: user.enabled,
      bio: user.bio || '',
    })
    setError('')
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = { ...form }
    if (editing && !payload.password) delete payload.password
    try {
      if (editing) {
        await adminApi.updateUser(editing.id, payload)
        toast.success('User updated successfully')
      } else {
        await adminApi.createUser(payload)
        toast.success('User created successfully')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return
    try {
      await adminApi.deleteUser(user.id)
      toast.success('User deleted successfully')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User management</h1>
          <p className="mt-1 text-sm text-slate-500">Create, edit and remove user accounts and roles.</p>
        </div>
        <Button onClick={openCreate}>+ New user</Button>
      </div>

      <Card bodyClassName="p-0">
        {loading ? (
          <PageLoader label="Loading users..." />
        ) : users.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No users found" action={<Button onClick={openCreate}>Create the first user</Button>} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{user.name}</td>
                    <td className="px-5 py-3 text-slate-600">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge color={user.role === 'ADMIN' ? 'indigo' : 'blue'}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color={user.enabled ? 'green' : 'red'}>{user.enabled ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(user)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(user)}>
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
        title={editing ? `Edit ${editing.name}` : 'Create user'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save changes' : 'Create user'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <Field label="Full name" required>
            <Input name="name" value={form.name} onChange={handleChange} required minLength={2} />
          </Field>
          <Field label="Email" required>
            <Input type="email" name="email" value={form.email} onChange={handleChange} required />
          </Field>
          <Field label={editing ? 'New password (leave blank to keep current)' : 'Password'} required={!editing}>
            <Input type="password" name="password" value={form.password} onChange={handleChange} minLength={8} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role" required>
              <Select name="role" value={form.role} onChange={handleChange}>
                <option value="MUSICIAN">Musician</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </Field>
            <Field label="Account status">
              <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="enabled" checked={form.enabled} onChange={handleChange} />
                Active (can sign in)
              </label>
            </Field>
          </div>
          <Field label="Bio">
            <Textarea name="bio" value={form.bio} onChange={handleChange} maxLength={500} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
