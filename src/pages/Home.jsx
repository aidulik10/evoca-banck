import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sections, slug } from '../data/site.js'
import Calc from '../components/Calc.jsx'
import Reveal from '../components/Reveal.jsx'
 
// Palette taken from evoca.am: purple #6400dc, banner backgrounds, lime accent #97FF00
const slides = [
  { t: 'Travel card with no foreign fees', d: 'Pay abroad, withdraw cash and track spending in one app.', to: '/personal/travel-card', bg: '#dadada', light: true },
  { t: 'Bring your salary, get more back', d: 'Cashback, free transfers and a higher deposit rate.', to: '/personal/salary-project', bg: '#6539aa' },
  { t: 'Home loans with clear payments', d: 'See the full cost of your mortgage before you apply.', to: '/personal/mortgage-loans', bg: '#E4DFFF', light: true },
  { t: 'Open a deposit in the app', d: 'Pick the amount and term. Interest builds every day.', to: '/personal/online-deposit', bg: '#000000' },
  { t: 'Digital card in minutes', d: 'Order in the app and use it right away.', to: '/personal/premium-cards', bg: '#FFDCFB', light: true },
]
 
const cards = [
  { n: 'Travel Card', g: 'linear-gradient(135deg,#6539aa,#6400dc)', d: 'No foreign fees, cashback abroad and cash withdrawals in one app.' },
  { n: 'Visa Platinum', g: 'linear-gradient(135deg,#c9ccd1,#f1f2f4)', dark: true, d: 'Everyday card with higher limits and travel insurance.' },
  { n: 'Visa Infinite', g: 'linear-gradient(135deg,#000,#3a3d41)', d: 'The highest Visa class: VIP status, insured trips and safe purchases.' },
  { n: 'Mastercard Gold', g: 'linear-gradient(135deg,#b6a44f,#ead98c)', dark: true, d: 'Book flights, hotels and cars in minutes.' },
  { n: 'Digital Card', g: 'linear-gradient(135deg,#FFDCFB,#E4DFFF)', dark: true, d: 'Order now and it appears in your app within minutes.' },
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
 
const Title = ({ children }) => <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">{children}</h2>
 
// The card tilts toward the cursor: the spot under the mouse sinks, the opposite edge lifts.
function CardArt({ c, className = '' }) {
  const [tilt, setTilt] = useState(null)
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    setTilt({ rx: (0.5 - y) * 2 * 16, ry: (x - 0.5) * 2 * 16, x: x * 100, y: y * 100 })
  }
  return (
    <div className={className} style={{ perspective: 800 }} onMouseMove={move} onMouseLeave={() => setTilt(null)}>
      <div
        className={`relative aspect-[415/261] overflow-hidden rounded-2xl p-5 will-change-transform motion-reduce:!transform-none ${c.dark ? 'text-ink' : 'text-white'}`}
        style={{
          background: c.g,
          transform: tilt ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(6px) scale(0.97)` : 'none',
          boxShadow: tilt ? '0 4px 10px rgba(0,0,0,.2)' : '0 12px 28px rgba(0,0,0,.25)',
          transition: tilt ? 'transform .08s linear, box-shadow .2s' : 'transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s',
        }}
      >
        {/* dark spot under the cursor, so the pressed area looks lower */}
        {tilt && <span className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at ${tilt.x}% ${tilt.y}%, rgba(0,0,0,.18), transparent 55%)` }} />}
        <p className="font-display text-xl font-bold lowercase tracking-tight">evoca</p>
        <div className="mt-4 h-6 w-9 rounded bg-white/60" />
        <p className="absolute bottom-4 left-5 text-sm tabular-nums tracking-widest opacity-80">•••• 4821</p>
        <p className="absolute bottom-4 right-5 text-xs font-semibold opacity-80">{c.n}</p>
      </div>
    </div>
  )
}
 
export default function Home() {
  const [i, setI] = useState(0)
  const [pause, setPause] = useState(false)
  const [tab, setTab] = useState('Cash')
  const [card, setCard] = useState(0)
  const [rev, setRev] = useState(0)
  const [amt, setAmt] = useState('10000')
  const [from, setFrom] = useState('AMD')
  const [to, setTo] = useState('USD')
 
  useEffect(() => {
    if (pause) return
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [pause])
  useEffect(() => {
    const id = setInterval(() => setRev((x) => (x + 1) % reviews.length), 6000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => { setFrom('AMD'); setTo('USD') }, [tab])
 
  const s = slides[i]
  const c = cards[card]
  const list = rates[tab]
  const ccy = ['AMD', ...list.map((r) => r[0])]
  const rate = (code, k) => (code === 'AMD' ? 1 : list.find((r) => r[0] === code)?.[k])
  const result = (() => {
    const a = parseFloat(amt)
    const f = rate(from, 1), t = rate(to, 2)
    return a && f && t ? ((a * f) / t).toLocaleString(undefined, { maximumFractionDigits: 2 }) : ''
  })()
  const quick = [...sections[0].groups, sections[1].groups[0]]
  const news = sections.find((x) => x.key === 'news').groups[0].items
  const sel = 'rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-semibold'
 
  return (
    <>
      {/* Banner slider: flat colour per slide, text colour follows the background */}
      <section onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
        style={{ background: s.bg }} className={`overflow-hidden transition-colors duration-700 ${s.light ? 'text-ink' : 'text-white'}`}>
        <div className="mx-auto grid min-h-[26rem] max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-2">
          <div key={i} className="slide-in">
            <h1 className="text-3xl font-medium leading-tight md:text-4xl">{s.t}</h1>
            <p className="mt-4 max-w-md text-lg opacity-80">{s.d}</p>
            <Link to={s.to} className={`mt-8 inline-block rounded-lg px-7 py-3 font-medium transition ${s.light ? 'bg-[#6400dc] text-white hover:bg-[#4600dc]' : 'bg-white text-ink hover:bg-[#E4DFFF]'}`}>Learn more</Link>
            <div className="mt-8 flex gap-2">
              {slides.map((_, n) => (
                <button key={n} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)}
                  className={`h-2 rounded-full transition-all ${n === i ? 'w-8 bg-current' : 'w-2 bg-current opacity-30'}`} />
              ))}
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <CardArt c={cards[i % cards.length]} className="w-80 animate-float" />
          </div>
        </div>
      </section>
 
      {/* Quick links */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quick.map((g, n) => (
            <Reveal key={g.title} delay={n * 50}>
              <Link to={`/${n < 7 ? 'personal' : 'business'}/${slug(g.items[0])}`} className="group block rounded-xl bg-[#E4DFFF]/60 p-5 transition hover:bg-[#6400dc] hover:text-white">
                <span className="mb-6 grid h-10 w-10 place-items-center rounded-full bg-white font-bold text-[#6400dc]">{g.title[0]}</span>
                <p className="font-medium">{n === 7 ? 'Business' : g.title}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
 
      {/* Cards showcase: list on the left, selected card on the right */}
      <section className="bg-paper py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[240px_1fr] md:items-center">
          <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
            {cards.map((k, n) => (
              <button key={k.n} onClick={() => setCard(n)}
                className={`flex shrink-0 items-center gap-3 rounded-xl border-2 bg-white p-2 pr-4 text-left transition ${n === card ? 'border-[#6400dc]' : 'border-transparent'}`}>
                <span className="h-10 w-16 rounded-md" style={{ background: k.g }} />
                <span className="text-sm font-medium">{k.n}</span>
              </button>
            ))}
          </div>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <CardArt c={c} className="w-full max-w-sm" />
            <div>
              <h2 className="text-3xl font-medium">{c.n}</h2>
              <p className="mt-3 text-ink/70">{c.d}</p>
              <Link to={`/personal/${slug(c.n)}`} className="mt-6 inline-block rounded-lg bg-[#6400dc] px-7 py-3 font-medium text-white transition hover:bg-[#4600dc]">Details</Link>
            </div>
          </div>
        </div>
      </section>
 
      <section className="py-14">
        <div className="mx-auto max-w-5xl px-5">
          <Title>Calculators</Title>
          <Reveal><Calc /></Reveal>
        </div>
      </section>
 
      {/* News: category label with lime underline, like Evoca */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-bold md:text-4xl">Latest news</h2>
            <Link to="/news" className="rounded-lg border border-[#6400dc] px-4 py-2 text-sm font-medium text-[#6400dc] transition hover:bg-[#6400dc] hover:text-white">All news</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((t, n) => (
              <Reveal key={t} delay={n * 80}>
                <Link to={`/news/${slug(t)}`} className="group block">
                  <div className="h-44 overflow-hidden rounded-xl" style={{ background: ['#6539aa', '#E4DFFF', '#FFDCFB'][n] }} />
                  <span className="mt-4 inline-block border-b-2 border-[#97FF00] text-sm font-medium">Lifestyle</span>
                  <p className="mt-2 text-lg font-medium transition group-hover:text-[#6400dc]">{t}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
 
      {/* Exchange rates + converter */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold md:text-4xl">Exchange rates</h2>
          <div className="flex gap-6 border-b border-ink/10 text-sm font-medium">
            {Object.keys(rates).map((k) => (
              <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-2 transition ${tab === k ? 'border-[#6400dc] text-[#6400dc]' : 'border-transparent text-ink/50'}`}>{k}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <table className="w-full text-left tabular-nums">
              <thead className="text-sm text-ink/50"><tr><th className="py-2" /><th>Buy</th><th>Sell</th></tr></thead>
              <tbody>{list.map(([k, b, s2]) => (
                <tr key={k} className="border-t border-ink/10 text-xl font-medium"><td className="py-3 text-base font-semibold">{k}</td><td>{b}</td><td>{s2}</td></tr>
              ))}</tbody>
            </table>
            <p className="mt-3 text-xs text-ink/40">Sample rates for the demo.</p>
          </div>
          <div className="rounded-2xl bg-[#E4DFFF]/60 p-6">
            {[['I have', from, setFrom, amt, (e) => setAmt(e.target.value)], ['I get', to, setTo, result, null]].map(([label, val, set, v, on]) => (
              <label key={label} className="mb-4 block last:mb-0">
                <span className="text-sm text-ink/60">{label}</span>
                <div className="mt-1 flex gap-2">
                  <input value={v} onChange={on || undefined} readOnly={!on} inputMode="decimal" className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-lg tabular-nums" />
                  <select value={val} onChange={(e) => set(e.target.value)} className={sel}>{ccy.map((x) => <option key={x}>{x}</option>)}</select>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>
 
      {/* Reviews: one centred quote at a time */}
      <section className="bg-[#6539aa] py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="mb-8 text-3xl font-bold md:text-4xl">What customers say</h2>
          <p className="text-2xl tracking-widest text-[#97FF00]" aria-label="5 out of 5">★★★★★</p>
          <div key={rev} className="slide-in">
            <p className="mt-5 min-h-[5rem] text-xl leading-relaxed">{reviews[rev][1]}</p>
            <p className="mt-4 font-medium">{reviews[rev][0]}</p>
            <p className="text-sm text-white/60">Customer</p>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {reviews.map((_, n) => (
              <button key={n} aria-label={`Review ${n + 1}`} onClick={() => setRev(n)}
                className={`h-2 rounded-full transition-all ${n === rev ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
 