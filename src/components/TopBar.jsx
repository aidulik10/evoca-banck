import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function TopBar() {
  const location = useLocation()

  const items = [
    { name: 'անհատ', path: '/personal' },
    { name: 'բիզնես', path: '/business' },
    { name: 'ակնթարթային վճարումներ', path: '/instant-payments' },
    { name: 'մեր մասին', path: '/about' },
    { name: 'նորություններ', path: '/news' },
    { name: 'բլոգ', path: '/blog' },
    { name: 'կարիերա', path: '/career' },
  ]

  return (
    <div className="bg-white border-b border-gray-200 text-sm py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-start gap-8">
        {items.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative py-2 transition-colors font-medium ${
                isActive ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              {isActive && (
                <span className="absolute -top-4 left-0 right-0 h-1 bg-purple-600 rounded-b" />
              )}
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}