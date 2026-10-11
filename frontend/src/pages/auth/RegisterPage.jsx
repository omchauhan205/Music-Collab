import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Alert, Button, Field, Input } from '../../components/ui'
import { extractErrorMessage } from '../../utils/format'

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await register(form)
      toast.success(`Account created. Welcome, ${user.name}!`)
      navigate('/musician', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src="/music.svg" alt="MusicCollab" className="h-8 w-8" />
          <span className="text-xl font-bold text-slate-900">MusicCollab</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Create your musician account</h1>
          <p className="mt-1 text-sm text-slate-500">Start collaborating in a couple of minutes.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && <Alert type="error">{error}</Alert>}
            <Field label="Full name" required>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Aria Vance" required minLength={2} />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Password" required hint="At least 8 characters">
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </Field>
            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
