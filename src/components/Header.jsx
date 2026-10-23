import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { sections, slug } from '../data/site.js'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 8)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${solid ? 'shadow-md' : ''}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="font-display text-2xl font-bold lowercase tracking-tight">evoca</Link>

        <nav className="hidden h-full lg:flex">
          {sections.map((s, i) => (
            <div key={s.key} className="group relative flex items-center">
              <NavLink to={`/${s.key}`} className="px-4 py-2 text-sm font-semibold text-ink/80 hover:text-brand">{s.title}</NavLink>
              <div className={`invisible absolute top-full grid w-[34rem] translate-y-2 grid-cols-2 gap-6 rounded-xl bg-white p-6 opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${i > 3 ? 'right-0' : 'left-0'}`}>
                {s.groups.map((g) => (
                  <div key={g.title}>
                    <p className="mb-2 text-sm font-bold">{g.title}</p>
                    {g.items.slice(0, 5).map((t) => (
                      <Link key={t} to={`/${s.key}/${slug(t)}`} className="block py-0.5 text-sm text-ink/60 hover:text-brand">{t}</Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden gap-2 text-xs font-semibold text-ink/60 sm:flex"><span className="text-ink">EN</span><span>HY</span><span>RU</span></div>
          <Link to="/personal/online-banking" className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink">Sign in</Link>
          <button aria-label="Menu" onClick={() => setOpen(!open)} className="text-2xl lg:hidden">{open ? '×' : '≡'}</button>
        </div>
      </div>

      {open && (
        <div className="max-h-[80vh] overflow-auto border-t bg-white px-5 py-4 lg:hidden">
          {sections.map((s) => (
            <details key={s.key} className="border-b py-2">
              <summary className="cursor-pointer font-semibold">{s.title}</summary>
              <div className="grid gap-1 py-2 pl-3">
                {s.groups.flatMap((g) => g.items).map((t) => (
                  <Link key={t} onClick={() => setOpen(false)} to={`/${s.key}/${slug(t)}`} className="text-sm text-ink/70">{t}</Link>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </header>
  )
}
