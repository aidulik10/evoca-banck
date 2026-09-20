import { Link, useParams } from 'react-router-dom'
import { sections, slug } from '../data/site.js'
import Reveal from '../components/Reveal.jsx'

export default function Section() {
  const { section } = useParams()
  const s = sections.find((x) => x.key === section)
  if (!s) return <p className="p-20 text-center">Page not found. <Link className="text-brand" to="/">Go home</Link></p>
  return (
    <>
      <div className="bg-ink px-5 py-16 text-white">
        <h1 className="mx-auto max-w-7xl font-display text-5xl font-extrabold">{s.title}</h1>
      </div>
      <div className="mx-auto max-w-7xl space-y-12 px-5 py-14">
        {s.groups.map((g) => (
          <Reveal key={g.title}>
            <h2 className="mb-4 font-display text-2xl font-bold">{g.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {g.items.map((t) => (
                <Link key={t} to={`/${s.key}/${slug(t)}`} className="rounded-xl border border-ink/10 p-5 font-semibold transition hover:-translate-y-1 hover:border-brand hover:text-brand hover:shadow-lg">{t}</Link>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}
