import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sections, slug } from '../data/site.js'
import Calc from '../components/Calc.jsx'
import Reveal from '../components/Reveal.jsx'

// Palette taken from evoca.am: purple #6400dc, banner backgrounds, lime accent #97FF00
const slides = [
  { t: 'Travel card with no foreign fees', d: 'Pay abroad, withdraw cash and track spending in one app.', to: '/personal/travel-card', bg: '#000000', img: 'https://www.evoca.am/images-cache/sliders/1/17737433784078/126c54e244e880fd563d8af43979486c-577x485.png' },
  { t: 'Bring your salary, get more back', d: 'Cashback, free transfers and a higher deposit rate.', to: '/personal/salary-project', bg: '#6539aa', img: 'https://www.evoca.am/images-cache/sliders/1/17740137222872/7152cafab4609e8483a365f79ecf04cb-577x486.png' },
  { t: 'Home loans with clear payments', d: 'See the full cost of your mortgage before you apply.', to: '/personal/mortgage-loans', bg: '#b28d48', img: 'https://www.evoca.am/images-cache/sliders/1/17262130779724/2fee1054871280f57daf5204f901c563-577x486.png' },
  { t: 'Open a deposit in the app', d: 'Pick the amount and term. Interest builds every day.', to: '/personal/online-deposit', bg: '#000000', img: 'https://www.evoca.am/images-cache/sliders/1/17612202124044/b74e87ec0e83aa10cb128d41f0ada026-577x486.png' },
  { t: 'Digital card in minutes', d: 'Order in the app and use it right away.', to: '/personal/premium-cards', bg: '#FFDCFB', light: true, img: 'https://www.evoca.am/images-cache/sliders/1/16178037539626/79381d3e68fdf7ec25c5837a19ce5821-577x486.jpg' },
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

const faces = [
  'https://www.evoca.am/img/temp/biometric/face3.png',
  'https://www.evoca.am/img/temp/biometric/face1.png',
  'https://www.evoca.am/img/temp/biometric/face2.png',
]

// Where the flat top edge of the purple triangle sits, in % of the box height.
// Smaller = the triangle starts higher (more of the body is inside it).
const TRI_TOP = 38

// Where the scanner web sits over the face, in % of the face box.
// top    = distance from the top edge (bigger = lower)
// height = size of the web (bigger = larger)
// x      = shift left (negative) or right (positive)
const SCAN = { top: 12, height: 64, x: 0 }

const Title = ({ children }) => <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">{children}</h2>

// Face-shaped outline: wide at the cheeks and forehead, tapering to the chin.
// k scales the shape around the centre (1 = outer contour), a is the angle.
const facePoint = (k, a) => {
  const s = Math.sin(a)
  const w = 1 - (s > 0 ? 0.3 * Math.pow(s, 1.6) : 0.06 * s * s)
  return [60 + 56 * k * Math.cos(a) * w, 80 + 74 * k * s]
}
const faceRing = (k) =>
  Array.from({ length: 48 }, (_, n) => facePoint(k, (n * Math.PI * 2) / 48).map((v) => v.toFixed(1)).join(',')).join(' ')

const RINGS = [0.25, 0.5, 0.75, 1]
const SPOKES = Array.from({ length: 14 }, (_, n) => (n * Math.PI * 2) / 14)

// White spider-web scanner in the shape of a face, with a scan line sweeping down it.
function FaceScan() {
  return (
    <svg
      viewBox="0 0 120 160"
      className="pointer-events-none absolute z-20 -translate-x-1/2"
      style={{
        top: `${SCAN.top}%`,
        left: `${50 + SCAN.x}%`,
        height: `${SCAN.height}%`,
        aspectRatio: '3 / 4',
        filter: 'drop-shadow(0 0 3px rgba(128,0,255,.7))',
      }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="scan-face"><polygon points={faceRing(1)} /></clipPath>
        <linearGradient id="scan-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <g clipPath="url(#scan-face)">
        {/* the web: face-shaped rings + spokes */}
        <g stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.85">
          {RINGS.map((k) => <polygon key={k} points={faceRing(k)} />)}
          {SPOKES.map((a) => {
            const [x, y] = facePoint(1, a)
            return <line key={a} x1="60" y1="80" x2={x} y2={y} />
          })}
        </g>
        {/* nodes where the threads cross */}
        <g fill="#fff">
          {RINGS.flatMap((k) => SPOKES.map((a) => {
            const [x, y] = facePoint(k, a)
            return <circle key={`${k}-${a}`} cx={x} cy={y} r="1.3" />
          }))}
        </g>
        {/* scan line with a glow trailing behind it, moving top to bottom */}
        <g>
          <rect x="0" y="-30" width="120" height="30" fill="url(#scan-glow)" />
          <rect x="0" y="-1" width="120" height="2" fill="#fff" />
          <animateTransform attributeName="transform" type="translate" from="0 8" to="0 160" dur="2.6s" repeatCount="indefinite" />
        </g>
      </g>

      {/* corner brackets */}
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M2 22 V2 H22" />
        <path d="M98 2 H118 V22" />
        <path d="M2 138 V158 H22" />
        <path d="M118 138 V158 H98" />
        <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
      </g>
    </svg>
  )
}

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
  const [faceIdx, setFaceIdx] = useState(0)

  useEffect(() => {
    if (pause) return
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [pause])
  useEffect(() => {
    const id = setInterval(() => setRev((x) => (x + 1) % reviews.length), 6000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    const id = setInterval(() => setFaceIdx((x) => (x + 1) % faces.length), 3000)
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
  const news = sections.find((x) => x.key === 'news').groups[0].items
  const sel = 'rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-semibold'

  return (
    <>
      {/* Banner slider: flat colour per slide, text colour follows the background */}
      <section onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
        style={{ background: s.bg, borderBottomLeftRadius: '200px' }} className={`overflow-hidden transition-colors duration-700 ${s.light ? 'text-ink' : 'text-white'}`}>
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-24">
          <div className="grid min-h-[22rem] items-center gap-8 md:grid-cols-2">
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
            {/* fixed-height box: the layout does not depend on when the image loads */}
            <div className="hidden h-[340px] items-center justify-center md:flex">
              {s.img ? (
                <img src={s.img} alt={s.t} className="h-full w-auto max-w-full animate-float object-contain" />
              ) : (
                <CardArt c={cards[i % cards.length]} className="w-80 animate-float" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Biometric / QR section: the body is cropped by the triangle, the head sticks out above it */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="relative mx-auto h-80 w-full max-w-sm md:h-96">
            {/* purple triangle */}
            <div
              className="absolute inset-0 bg-[#8000ff]"
              style={{ clipPath: `polygon(0 ${TRI_TOP}%, 100% ${TRI_TOP}%, 50% 100%)` }}
            />
            {/* faces: full width above the triangle edge, cut along the triangle sides below it */}
            {faces.map((src, n) => (
              <img
                key={src}
                src={src}
                alt="Biometric"
                loading="eager"
                className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-700 ${n === faceIdx ? 'opacity-100' : 'opacity-0'}`}
                style={{ clipPath: `polygon(0 0, 100% 0, 100% ${TRI_TOP}%, 50% 100%, 0 ${TRI_TOP}%)` }}
              />
            ))}
            {/* spider-web scanner over the face */}
            <FaceScan />
          </div>
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="mb-6 text-2xl font-bold md:text-3xl">Сканируйте QR-код для входа</h3>
            <img src="https://www.evoca.am/img/biometric-section-QR-Code.png" alt="QR Code" className="h-44 w-44 rounded-xl bg-white object-contain p-2 shadow-md" />
          </div>
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