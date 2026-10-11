import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { portfolioApi, publicApi } from '../api/endpoints'
import { Badge, Card, EmptyState, PageLoader } from '../components/ui'
import { formatDate, initials } from '../utils/format'

export default function PublicPortfolioPage() {
  const { userId } = useParams()
  const [musician, setMusician] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([publicApi.musician(userId), portfolioApi.publicByUser(userId)])
      .then(([m, p]) => {
        setMusician(m.data)
        setItems(p.data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <PageLoader label="Loading portfolio..." />

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState title="Musician not found" action={<Link to="/">Back home</Link>} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/music.svg" alt="MusicCollab" className="h-7 w-7" />
            <span className="text-lg font-bold text-slate-900">MusicCollab</span>
          </Link>
          <Link to="/login" className="text-sm font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Card>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
              {initials(musician.name)}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{musician.name}</h1>
              <p className="text-sm text-slate-500">{musician.bio || 'Musician on MusicCollab'}</p>
            </div>
          </div>
        </Card>

        <h2 className="mb-4 mt-8 text-lg font-semibold text-slate-900">Portfolio ({items.length})</h2>
        {items.length === 0 ? (
          <EmptyState title="No portfolio items yet" description="This musician has not published anything yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <Badge color={item.type === 'ALBUM' ? 'indigo' : 'blue'}>{item.type}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.description || 'No description'}</p>
                <p className="mt-3 text-xs text-slate-400">Released {formatDate(item.releaseDate)}</p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
