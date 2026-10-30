import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import TopBar from './components/TopBar.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

// Импортируем главную страницу и отдельные страницы разделов
import Home from './pages/Home.jsx'
import Personal from './pages/Personal.jsx'
import Business from './pages/Business.jsx'
import InstantPayments from './pages/InstantPayments.jsx'
import About from './pages/About.jsx'
import News from './pages/News.jsx'
import Blog from './pages/Blog.jsx'
import Career from './pages/Career.jsx'
import Page from './pages/Page.jsx' // Оставляем для вложенных страниц, если нужны

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
      <TopBar />
      <Header />
      <main className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/business" element={<Business />} />
          <Route path="/instant-payments" element={<InstantPayments />} />
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/career" element={<Career />} />
          
          {/* Вложенные страницы (например: /news/some-slug) */}
          <Route path="/:section/:slug" element={<Page />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}