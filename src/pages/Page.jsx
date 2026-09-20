import { Link, useParams } from 'react-router-dom'
import { allPages, findPage } from '../data/site.js'
import Calc from '../components/Calc.jsx'
import Reveal from '../components/Reveal.jsx'

const features = [
  ['Clear terms', 'Every fee and rate is shown before you agree to anything.'],
  ['Apply online', 'Fill in the form in the app. Most requests get a reply the same day.'],
  ['Real people', 'Call or visit a branch if you would rather talk it through.'],
]

export default function Page() {
  const { section, slug } = useParams()
  const p = findPage(section, slug)
  if (!p) return <p className="p-20 text-center">Page not found. <Link className="text-brand" to="/">Go home</Link></p>
  const related = allPages.filter((x) => x.section === p.section && x.group === p.group && x.slug !== p.slug)
  const calc = p.group === 'Loans' ? 'loan' : p.group === 'Deposits' ? 'deposit' : null

  return (
    <>
      <div className="bg-ink px-5 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-sm text-white/60"><Link to="/" className="hover:text-white">Home</Link> / <Link to={`/${p.section}`} className="hover:text-white">{p.sectionTitle}</Link> / {p.group}</p>
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">{p.title}</h1>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <p className="max-w-2xl text-lg text-ink/70">This is the {p.title.toLowerCase()} page. Replace this text with the real description of the service, its conditions and what the customer needs to do next.</p>
          {calc && <Reveal><Calc start={calc} /></Reveal>}
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(([t, d], i) => (
              <Reveal key={t} delay={i * 80} className="rounded-xl bg-paper p-5">
                <h3 className="mb-1 font-display text-lg font-bold">{t}</h3>
                <p className="text-sm text-ink/70">{d}</p>
              </Reveal>
            ))}
          </div>
          <Link to="/personal/mobile-app" className="inline-block rounded-full bg-brand px-7 py-3 font-semibold text-white transition hover:bg-ink">Apply in the app</Link>
        </div>
        {related.length > 0 && (
          <aside className="h-fit rounded-xl border border-ink/10 p-5">
            <p className="mb-2 font-display font-bold">More in {p.group}</p>
            {related.map((x) => <Link key={x.path} to={x.path} className="block py-1 text-sm text-ink/70 hover:text-brand">{x.title}</Link>)}
          </aside>
        )}
      </div>
    </>
  )
}
