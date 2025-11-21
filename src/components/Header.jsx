import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${isScrolled ? 'bg-gray-900 shadow-md' : 'bg-transparent'}
      `}
    >
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/Design_sem_nome-removebg-preview.png"
            alt="KitadiHub Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-lg md:text-xl font-bold tracking-wide text-white">
            KitadiHub <span className="text-blue-400">• Controlo Financeiro</span>
          </h1>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white">
          <Link to="/dashboard" className="hover:text-blue-400 transition">Início</Link>
          <Link to="/reports" className="hover:text-blue-400 transition">Relatórios</Link>
          <Link to="/goals" className="hover:text-blue-400 transition">Metas Financeiras</Link>
        </nav>
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-3 px-4 pb-4 bg-gray-900 shadow-md">
          <nav className="flex flex-col gap-3 text-sm font-medium text-white">
            <Link to="/dashboard" className="hover:text-blue-400 transition">Início</Link>
            <Link to="/reports" className="hover:text-blue-400 transition">Relatórios</Link>
            <Link to="/goals" className="hover:text-blue-400 transition">Metas Financeiras</Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
