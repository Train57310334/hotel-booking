import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Menu, X, User, LogOut, Home, Search, CalendarDays, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NavBar(props) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
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
            {props.logo ? (
              <div className="h-10 w-10 relative rounded-xl overflow-hidden shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                <img src={props.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-primary-600 p-1.5 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary-500/20">
                <img src="/logo.png" alt="BookingKub" className="w-full h-full object-contain brightness-0 invert" />
              </div>
            )}
            <span className={`text-xl font-display font-bold tracking-tight transition-colors ${showSolidNav ? 'text-slate-900' : 'text-white'}`}>
              {props.brandName || 'BookingKub'}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {props.mode === 'saas' ? (
              <>
                <a href="#features" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Features</a>
                <a href="#pricing" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Pricing</a>
                <a href="#contact" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Contact</a>
              </>
            ) : (
              <>
                <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>{t('nav.home')}</Link>
                <Link href="/contact" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>{t('nav.contact')}</Link>
                {user ? (
                  <Link href="/account/dashboard" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>{t('nav.myBookings')}</Link>
                ) : (
                  <Link href="/find-booking" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>{t('nav.findBooking')}</Link>
                )}

                {/* Language Toggle Desktop */}
                <button
                  onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                  className={`flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded-md transition-colors hover:bg-slate-100 ${showSolidNav ? 'text-slate-600' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <Globe size={16} />
                  {language.toUpperCase()}
                </button>
              </>
            )}

            <div className={`pl-4 border-l transition-colors ${showSolidNav ? 'border-slate-200' : 'border-white/20'}`}>
              {user ? (
                <div className="flex items-center gap-4">
                  {(user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin') || user.roleAssignments?.length > 0) && (
                    <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Admin</Link>
                  )}
                  {!(user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin') || user.roleAssignments?.length > 0) && (
                    <Link href="/account/dashboard" className={`text-sm font-medium transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>Dashboard</Link>
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
                  <Link href="/auth/login" className={`text-sm font-medium px-3 py-2 transition-colors hover:text-primary-500 ${showSolidNav ? 'text-slate-600' : 'text-white/90'}`}>{t('nav.login')}</Link>
                  <Link href="/auth/register" className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-900/20">
                    {props.mode === 'saas' ? 'Start Free' : t('auth.registerBtn')}
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
        <div className="fixed inset-0 z-40 bg-white md:hidden pt-24 px-6 animate-in slide-in-from-top-10 duration-200 flex flex-col h-screen overflow-y-auto pb-20">
          <div className="flex flex-col gap-6 text-lg font-medium text-slate-800">

            {/* Mode Specific Links */}
            {props.mode === 'saas' ? (
              <>
                <a href="#features" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#pricing" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </a>
                <a href="#contact" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </a>
              </>
            ) : (
              <>
                <Link href="/" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <Home size={20} className="text-slate-400" />
                  {t('nav.home')}
                </Link>
                {user ? (
                  <Link href="/account/dashboard" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <CalendarDays size={20} className="text-slate-400" />
                    {t('nav.myBookings')}
                  </Link>
                ) : (
                  <Link href="/find-booking" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Search size={20} className="text-slate-400" />
                    {t('nav.findBooking')}
                  </Link>
                )}
                <Link href="/contact" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.contact')}
                </Link>

                {/* Language Toggle Mobile */}
                <button
                  onClick={() => {
                    setLanguage(language === 'en' ? 'th' : 'en');
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <Globe size={20} className="text-slate-400" />
                  Switch to {language === 'en' ? 'Thai (TH)' : 'English (EN)'}
                </button>
              </>
            )}

            <hr className="border-slate-100" />

            {/* User / Auth Actions */}
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
                {(user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin') || user.roleAssignments?.length > 0) ? (
                  <Link href="/admin" className="block text-center w-full py-3 rounded-xl border border-slate-200 font-bold hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                    Go to Admin Dashboard
                  </Link>
                ) : (
                  <Link href="/account/dashboard" className="block text-center w-full py-3 rounded-xl border border-slate-200 font-bold hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                    Go to My Dashboard
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
                  {props.mode === 'saas' ? 'Start Free' : 'Create Account'}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav >
  )
}
