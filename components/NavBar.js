import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'

export default function NavBar() {
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    if (typeof window !== 'undefined') {
      setUser(localStorage.getItem('userName'))
    }

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
    }
    window.location.href = '/'
  }

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-primary-100' : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <span className={`text-xl font-display font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
              BookingKub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Search</Link>
            <Link href="/account/bookings" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">My Bookings</Link>

            <div className="pl-4 border-l border-slate-200">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User size={16} className="text-primary-500" />
                    {user}
                  </span>
                  <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 px-3 py-2">Login</Link>
                  <Link href="/auth/register" className="btn-primary flex items-center gap-2 text-sm">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  )
}
