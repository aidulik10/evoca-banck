import { Link } from 'react-router-dom'
import { sections, slug } from '../data/site.js'

export default function Footer() {
  return (
    <footer className="bg-ink text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {['personal', 'business', 'about', 'support'].map((k) => {
          const s = sections.find((x) => x.key === k)
          return (
            <div key={k}>
              <Link to={`/${k}`} className="mb-3 block font-display text-lg text-white">{s.title}</Link>
              {s.groups.flatMap((g) => g.items).slice(0, 7).map((t) => (
                <Link key={t} to={`/${k}/${slug(t)}`} className="block py-0.5 text-sm hover:text-white">{t}</Link>
              ))}
            </div>
          )
        })}
      </div>
      <p className="border-t border-white/10 px-5 py-6 text-center text-xs">
        Kestrel Bank is a fictional demo project. Rates, products and reviews are sample content.
      </p>
    </footer>
  )
}
