import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Menu, X, User, LogOut, Home, Search, CalendarDays } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function NavBar(props) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.asPath])

  const isTransparentPage = router.pathname === '/' || router.pathname === '/contact';
  const showSolidNav = scrolled || mobileMenuOpen || !isTransparentPage || props.forceSolid;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 print:hidden ${showSolidNav ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group relative z-50">
            <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <span className={`text-xl font-display font-bold tracking-tight transition-colors ${showSolidNav ? 'text-slate-900' : 'text-white'}`}>
              BookingKub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Home</Link>
            <Link href="/contact" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Contact</Link>
            <Link href="/account/bookings" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>My Bookings</Link>

            <div className={`pl-4 border-l transition-colors ${showSolidNav ? 'border-slate-200' : 'border-white/20'}`}>
              {user ? (
                <div className="flex items-center gap-4">
                  {(user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin')) && (
                    <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Admin</Link>
                  )}
                  <span className={`text-sm font-medium flex items-center gap-2 ${showSolidNav ? 'text-slate-700' : 'text-white'}`}>
                    <User size={16} className="text-primary-500" />
                    {user.name}
                  </span>
                  <button onClick={logout} className={`p-2 transition-colors hover:text-red-500 ${showSolidNav ? 'text-slate-400' : 'text-white/70'}`}>
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login" className={`text-sm font-medium px-3 py-2 transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Login</Link>
                  <Link href="/auth/register" className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-900/20">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 relative z-50 ${showSolidNav ? 'text-slate-600' : 'text-white'}`}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden pt-24 px-6 animate-in slide-in-from-top-10 duration-200">
          <div className="flex flex-col gap-6 text-lg font-medium text-slate-800">
            <Link href="/account/bookings" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm">
                <CalendarDays size={20} />
              </div>
              My Bookings
            </Link>

            <hr className="border-slate-100" />

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    {user.name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                {(user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin')) && (
                  <Link href="/admin" className="block text-center w-full py-3 rounded-xl border border-slate-200 font-bold hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                    Go to Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/auth/login" className="w-full py-3 rounded-xl border border-slate-200 font-bold text-slate-600 text-center hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary w-full py-3 rounded-xl text-center justify-center" onClick={() => setMobileMenuOpen(false)}>
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav >
  )
}
