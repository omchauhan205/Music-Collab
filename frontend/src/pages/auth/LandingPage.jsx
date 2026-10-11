import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const features = [
  {
    title: 'Project Collaboration',
    text: 'Create projects, invite collaborators, track deadlines and keep every contribution in sync.',
    icon: '🎼',
  },
  {
    title: 'Share & Edit Music Files',
    text: 'Upload tracks, iterate with version history, and review comments from your collaborators.',
    icon: '🎵',
  },
  {
    title: 'Manage Your Portfolio',
    text: 'Publish songs and albums, keep your portfolio current and share it with a public link.',
    icon: '💼',
  },
]

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : '/musician'

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <img src="/music.svg" alt="MusicCollab" className="h-8 w-8" />
          <span className="text-xl font-bold text-slate-900">MusicCollab</span>
        </div>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={dashboardPath}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center">
        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Online Music Collaboration Platform
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Make music together, from anywhere
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          MusicCollab brings musicians, projects and files into one clean workspace. Collaborate on
          tracks, manage versions and publish your portfolio — while administrators keep the platform
          safe and organised.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create your account
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">For musicians</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Create and manage collaborative projects</li>
              <li>• Upload tracks and iterate with version history</li>
              <li>• Comment and review changes with your team</li>
              <li>• Curate songs and albums in your portfolio</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">For administrators</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Manage user accounts and roles</li>
              <li>• Approve or reject user-generated content</li>
              <li>• Configure system-wide settings and access</li>
              <li>• Monitor real-time activity and performance</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        MusicCollab — Online Music Collaboration Platform
      </footer>
    </div>
  )
}
