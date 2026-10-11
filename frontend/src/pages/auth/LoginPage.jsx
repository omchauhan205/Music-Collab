import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Alert, Button, Field, Input } from '../../components/ui'
import { extractErrorMessage } from '../../utils/format'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.name}!`)
      const from = location.state?.from?.pathname
      navigate(from || (user.role === 'ADMIN' ? '/admin' : '/musician'), { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    const creds =
      role === 'admin'
        ? { email: 'admin@musiccollab.com', password: 'Password@123' }
        : { email: 'aria@musiccollab.com', password: 'Password@123' }
    setForm(creds)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src="/music.svg" alt="MusicCollab" className="h-8 w-8" />
          <span className="text-xl font-bold text-slate-900">MusicCollab</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Access your collaboration workspace.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && <Alert type="error">{error}</Alert>}
            <Field label="Email" required>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-600">Demo accounts</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => fillDemo('admin')} className="rounded bg-white px-2 py-1 shadow-sm hover:bg-slate-100">
                Admin
              </button>
              <button
                onClick={() => fillDemo('musician')}
                className="rounded bg-white px-2 py-1 shadow-sm hover:bg-slate-100"
              >
                Musician
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
