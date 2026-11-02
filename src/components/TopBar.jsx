import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function TopBar() {
  const location = useLocation()
  
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)

  const leftRef = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (leftRef.current && !leftRef.current.contains(event.target)) {
        setIsLeftOpen(false)
      }
      if (rightRef.current && !rightRef.current.contains(event.target)) {
        setIsRightOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const items = [
    { name: 'անհատ', path: '/personal' },
    { name: 'բիզնես', path: '/business' },
    { name: 'ակնթարթային վճարումներ', path: '/instant-payments' },
    { name: 'մեր մասին', path: '/about' },
    { name: 'նորություններ', path: '/news' },
    { name: 'բլոգ', path: '/blog' },
    { name: 'կարիերա', path: '/career' },
  ]

  const leftDropdownItems = [
    { name: 'ՓՄՁ վարկավորում', path: '/sme-lending' },
    { name: 'Visa Infinite', path: '/visa-infinite' },
    { name: 'MasterCard Gold', path: '/mastercard-gold' },
    { name: 'Visa Gold', path: '/visa-gold' },
  ]

  return (
    <div className="bg-white border-b border-gray-200 text-sm py-3 relative z-50">
      {/* Убрали justify-between, теперь все элементы идут подряд с одинаковым отступом */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 flex-wrap">
        
        {/* Основные ссылки */}
        {items.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative py-1 transition-colors font-medium ${
                isActive ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              {isActive && (
                <span className="absolute -top-3 left-0 right-0 h-1 bg-purple-600 rounded-b" />
              )}
              {item.name}
            </Link>
          )
        })}

        {/* Кнопка "Առցանց հայտեր" */}
        <div className="relative" ref={leftRef}>
          <button
            onClick={() => {
              setIsLeftOpen(!isLeftOpen)
              setIsRightOpen(false)
            }}
            className="flex items-center gap-1 text-purple-600 font-medium py-1 focus:outline-none hover:opacity-80 transition-opacity"
          >
            <span>Առցանց հայտեր</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isLeftOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLeftOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-[100]">
              {leftDropdownItems.map((subItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  onClick={() => setIsLeftOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка "Հետադարձ կապ" (теперь находится сразу рядом с предыдущей) */}
        <div className="relative" ref={rightRef}>
          <button
            onClick={() => {
              setIsRightOpen(!isRightOpen)
              setIsLeftOpen(false)
            }}
            className="flex items-center gap-1 text-purple-600 font-medium py-1 focus:outline-none hover:opacity-80 transition-opacity"
          >
            <span>Հետադարձ կապ</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isRightOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isRightOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl py-3 px-4 z-[100] text-gray-700 space-y-2.5">
              <a href="tel:+37410605555" className="block hover:text-purple-600 transition-colors">
                +374 10 605555
              </a>
              <a href="tel:+37498205555" className="block hover:text-purple-600 transition-colors">
                +374 98 205555
              </a>
              <a href="tel:+37499605555" className="block hover:text-purple-600 transition-colors">
                +374 99 605555
              </a>
              <a href="tel:8444" className="block font-semibold hover:text-purple-600 transition-colors">
                8444
              </a>
              <div className="border-t border-gray-100 pt-2">
                <button 
                  onClick={() => {
                    setIsRightOpen(false)
                    alert('Запрос на обратный звонок')
                  }}
                  className="w-full text-center bg-purple-600 text-white rounded-lg py-2 font-medium hover:bg-purple-700 transition-colors"
                >
                  Պատվիրել զանգ
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}