import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Menu, X, User, LogOut, Home, Search, CalendarDays, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NavBar(props) {
  const router = useRouter()
  const { user, logout, guestHotelId } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Determine the active hotel ID from the URL or local storage
  const activeHotelId = router.query.hotelId || guestHotelId;

  // ... (keep existing useEffects and constants) ...
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

  // Use a dark theme for SaaS mode to match the dark Hero and Contact sections, or regular light theme otherwise
  const isSaas = props.mode === 'saas';
  const navbarBg = isSaas
    ? (showSolidNav ? 'bg-[#0A0F1C]/90 backdrop-blur-md border-b border-white/10 shadow-xl' : 'bg-transparent text-white')
    : (showSolidNav ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent text-slate-800');

  const textColor = isSaas ? 'text-white' : (showSolidNav ? 'text-slate-900' : 'text-slate-800');
  const linkColor = isSaas ? 'text-slate-300 hover:text-white' : (showSolidNav ? 'text-slate-600 hover:text-primary-600' : 'text-slate-600 hover:text-primary-600');

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 print:hidden ${navbarBg}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 relative">
          <Link href={activeHotelId ? `/?hotelId=${activeHotelId}` : '/'} className="flex items-center gap-3 group relative z-50">
            {props.logo ? (
              <div className="h-10 w-10 relative rounded-xl overflow-hidden shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                <img src={props.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-primary-600 to-emerald-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary-500/20">
                <img src="/logo.png" alt="BookingKub" className="w-full h-full object-contain brightness-0 invert" />
              </div>
            )}
            <span className={`text-xl font-display font-bold tracking-tight transition-colors ${textColor}`}>
              {props.brandName || 'BookingKub'}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isSaas ? (
              <>
                <a href="#features" className={`text-sm font-medium transition-colors ${linkColor}`}>Features</a>
                <a href="#pricing" className={`text-sm font-medium transition-colors ${linkColor}`}>Pricing</a>
                <a href="#contact" className={`text-sm font-medium transition-colors ${linkColor}`}>Contact</a>
              </>
            ) : (
              <>
                <Link href={activeHotelId ? `/?hotelId=${activeHotelId}` : '/'} className={`text-sm font-medium transition-colors ${linkColor}`}>{t('nav.home')}</Link>
                <Link href={activeHotelId ? `/contact?hotelId=${activeHotelId}` : '/contact'} className={`text-sm font-medium transition-colors ${linkColor}`}>{t('nav.contact')}</Link>
                {user ? (
                  <Link href={activeHotelId ? `/account/dashboard?hotelId=${activeHotelId}` : "/account/dashboard"} className={`text-sm font-medium transition-colors ${linkColor}`}>{t('nav.myBookings')}</Link>
                ) : (
                  <Link href={activeHotelId ? `/find-booking?hotelId=${activeHotelId}` : "/find-booking"} className={`text-sm font-medium transition-colors ${linkColor}`}>{t('nav.findBooking')}</Link>
                )}

                {/* Language Toggle Desktop */}
                <button
                  onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                  className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100/10 ${textColor}`}
                >
                  <Globe size={16} />
                  {language.toUpperCase()}
                </button>
              </>
            )}

            <div className={`pl-6 border-l transition-colors ${isSaas ? 'border-white/10' : (showSolidNav ? 'border-slate-200' : 'border-slate-300')}`}>
              {user ? (
                <div className="flex items-center gap-4">
                  {(user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin') || user.roleAssignments?.length > 0) && (
                    <Link href="/admin" className={`text-sm font-medium transition-colors ${linkColor}`}>Admin</Link>
                  )}
                  {!(user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin') || user.roleAssignments?.length > 0) && (
                    <Link href="/account/dashboard" className={`text-sm font-medium transition-colors ${linkColor}`}>Dashboard</Link>
                  )}
                  <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                    <User size={16} className="text-primary-500" />
                    {user.name}
                  </span>
                  <button onClick={logout} className={`p-2 transition-colors hover:text-red-500 ${isSaas ? 'text-slate-400' : 'text-slate-500'}`}>
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login" className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${isSaas ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>{t('nav.login')}</Link>
                  <Link href="/auth/register" className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 text-sm">
                    {isSaas ? 'Start Free' : t('auth.registerBtn')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 relative z-50 ${mobileMenuOpen ? 'text-slate-900' : textColor}`}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                <Link href={activeHotelId ? `/?hotelId=${activeHotelId}` : '/'} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <Home size={20} className="text-slate-400" />
                  {t('nav.home')}
                </Link>
                {user ? (
                  <Link href={activeHotelId ? `/account/dashboard?hotelId=${activeHotelId}` : "/account/dashboard"} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <CalendarDays size={20} className="text-slate-400" />
                    {t('nav.myBookings')}
                  </Link>
                ) : (
                  <Link href={activeHotelId ? `/find-booking?hotelId=${activeHotelId}` : "/find-booking"} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Search size={20} className="text-slate-400" />
                    {t('nav.findBooking')}
                  </Link>
                )}
                <Link href={activeHotelId ? `/contact?hotelId=${activeHotelId}` : '/contact'} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
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
