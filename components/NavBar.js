import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-primary-100' : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <span className={`text-xl font-display font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              BookingKub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary-500 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>Search</Link>
            <Link href="/account/bookings" className={`text-sm font-medium transition-colors hover:text-primary-500 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>My Bookings</Link>

            <div className={`pl-4 border-l transition-colors ${scrolled ? 'border-slate-200' : 'border-white/20'}`}>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary-500 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>Admin</Link>
                  <span className={`text-sm font-medium flex items-center gap-2 ${scrolled ? 'text-slate-700' : 'text-white'}`}>
                    <User size={16} className="text-primary-500" />
                    {user.name}
                  </span>
                  <button onClick={logout} className={`p-2 transition-colors hover:text-red-500 ${scrolled ? 'text-slate-400' : 'text-white/70'}`}>
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login" className={`text-sm font-medium px-3 py-2 transition-colors hover:text-primary-500 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>Login</Link>
                  <Link href="/auth/register" className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-900/20">
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
    </nav >
  )
}
