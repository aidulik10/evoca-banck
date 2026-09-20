import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sections, slug } from '../data/site.js'
import Calc from '../components/Calc.jsx'
import Reveal from '../components/Reveal.jsx'

const slides = [
  { t: 'Travel card with no foreign fees', d: 'Pay abroad, withdraw cash and track spending in one app.', to: '/personal/travel-card', bg: '#10233f' },
  { t: 'Bring your salary, get more back', d: 'Cashback, free transfers and a higher deposit rate.', to: '/personal/salary-project', bg: '#0f5c56' },
  { t: 'Home loans with clear payments', d: 'See the full cost of your mortgage before you apply.', to: '/personal/mortgage-loans', bg: '#3a2f7a' },
  { t: 'Open a deposit in the app', d: 'Pick the amount and term. Interest builds every day.', to: '/personal/online-deposit', bg: '#7a4a10' },
]

const rates = {
  Cash: [['USD', 361, 365], ['EUR', 412, 423], ['GBP', 477, 496], ['CHF', 430, 455]],
  'Non-cash': [['USD', 361, 365.5], ['EUR', 412, 423], ['GBP', 477, 496], ['CNY', 53, 56]],
}

const reviews = [
  ['Anna M.', 'The mortgage schedule was clear from day one. No surprises at the branch.'],
  ['David K.', 'I opened my account from my phone in ten minutes.'],
  ['Lilit S.', 'Support answered my card question in the chat within a minute.'],
]

export default function Home() {
  const [i, setI] = useState(0)
  const [pause, setPause] = useState(false)
  const [tab, setTab] = useState('Cash')
  useEffect(() => {
    if (pause) return
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [pause])
  const s = slides[i]
  const quick = [...sections[0].groups, sections[1].groups[0]]
  const news = sections.find((x) => x.key === 'news').groups[0].items

  return (
    <>
      <section onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
        style={{ background: s.bg }} className="overflow-hidden text-white transition-colors duration-700">
        <div className="mx-auto grid min-h-[26rem] max-w-7xl items-center gap-8 px-5 py-14 md:grid-cols-2">
          <div key={i} className="slide-in">
            <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">{s.t}</h1>
            <p className="mt-4 max-w-md text-lg text-white/80">{s.d}</p>
            <Link to={s.to} className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-semibold text-ink transition hover:bg-amber">Learn more</Link>
            <div className="mt-8 flex gap-2">
              {slides.map((_, n) => (
                <button key={n} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)}
                  className={`h-2 rounded-full transition-all ${n === i ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
              ))}
            </div>
          </div>
          <div className="relative hidden h-64 md:block">
            <div className="absolute right-6 top-4 h-44 w-72 rounded-2xl bg-white/15 transition-transform duration-700" style={{ transform: `rotate(${i * 6 - 12}deg)` }} />
            <div className="absolute right-12 top-8 h-44 w-72 animate-float rounded-2xl bg-white p-6 text-ink shadow-2xl">
              <p className="font-display text-xl font-extrabold">Kestrel<span className="text-brand">.</span></p>
              <div className="mt-6 h-7 w-10 rounded bg-amber" />
              <p className="mt-6 tabular-nums tracking-widest">•••• •••• •••• 4821</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quick.map((g, n) => (
            <Reveal key={g.title} delay={n * 50}>
              <Link to={`/${n < 7 ? 'personal' : 'business'}/${slug(g.items[0])}`} className="group block rounded-xl bg-paper p-5 transition hover:-translate-y-1 hover:bg-brand hover:text-white">
                <span className="mb-6 grid h-10 w-10 place-items-center rounded-full bg-white font-display font-bold text-brand">{g.title[0]}</span>
                <p className="font-semibold">{n === 7 ? 'Business' : g.title}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper py-14">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="mb-6 font-display text-3xl font-extrabold">Calculators</h2>
          <Reveal><Calc /></Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl font-extrabold">Exchange rates</h2>
          <div className="rounded-full bg-paper p-1 text-sm font-semibold">
            {Object.keys(rates).map((k) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 transition ${tab === k ? 'bg-ink text-white' : 'text-ink/60'}`}>{k}</button>
            ))}
          </div>
        </div>
        <table className="w-full max-w-xl text-left tabular-nums">
          <thead className="text-sm text-ink/50"><tr><th className="py-2">Currency</th><th>Buy</th><th>Sell</th></tr></thead>
          <tbody>{rates[tab].map(([c, b, s2]) => <tr key={c} className="border-t border-ink/10"><td className="py-3 font-semibold">{c}</td><td>{b}</td><td>{s2}</td></tr>)}</tbody>
        </table>
        <p className="mt-3 text-xs text-ink/40">Sample rates for the demo.</p>
      </section>

      <section className="bg-paper py-14">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl font-extrabold">Latest news</h2>
            <Link to="/news" className="text-sm font-semibold text-brand">All news</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {news.map((t, n) => (
              <Reveal key={t} delay={n * 80}>
                <Link to={`/news/${slug(t)}`} className="block overflow-hidden rounded-xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-36" style={{ background: ['#2f6bff', '#19b394', '#f5b942'][n] }} />
                  <p className="p-5 font-semibold">{t}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <h2 className="mb-6 font-display text-3xl font-extrabold">What customers say</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map(([n, t], k) => (
            <Reveal key={n} delay={k * 80} className="rounded-xl border border-ink/10 p-6">
              <p className="text-ink/80">{t}</p>
              <p className="mt-4 text-sm font-semibold">{n}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
