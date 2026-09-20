import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Section from './pages/Section.jsx'
import Page from './pages/Page.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
  window.scrollTo(0, 0)
}, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Header />
      <main className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:section" element={<Section />} />
          <Route path="/:section/:slug" element={<Page />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
