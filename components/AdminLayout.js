import Link from 'next/link'
import { useRouter } from 'next/router'
import {
    LayoutDashboard,
    Users,
    BedDouble,
    CalendarDays,
    UserCircle,
    CreditCard,
    MessageSquare,
    Star,
    Settings,
    Bell,
    Search,
    Moon,
    X,
    Menu,
    LogOut,
    Filter,
    TicketPercent,
    TrendingUp,
    HelpCircle,
    Globe,
    SprayCan,
    ChevronDown
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'
import { useState, useEffect } from 'react'
import GuideModal from './GuideModal'
import { guideData, defaultGuide } from '@/data/guides'
import GlobalSearch from './GlobalSearch'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const { user, logout, loading } = useAuth()
    const { searchQuery, setSearchQuery, currentHotel, allHotels, switchHotel } = useAdmin() || {}
    const [darkMode, setDarkMode] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [hotelSwitcherOpen, setHotelSwitcherOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [guideOpen, setGuideOpen] = useState(false)

    // Determine current guide content
    const currentGuide = guideData[router.pathname] || defaultGuide

    // Clear search on route change
    useEffect(() => {
        if (setSearchQuery) setSearchQuery('')
    }, [router.pathname, setSearchQuery])


    // Fetch Notifications (Poll every 30s)
    useEffect(() => {
        if (loading) return

        if (!user) {
            router.push('/auth/login');
            return;
        }

        // 🔒 RBAC Guard: Only Admins allowed
        const isAdmin = user.roles?.includes('hotel_admin') || user.roles?.includes('platform_admin');

        // 🏨 Onboarding Check: If Admin has no Hotel, redirect to Setup
        const hasHotel = user.roleAssignments?.length > 0;
        const isPlatformAdmin = user.roles?.includes('platform_admin');
        const isSetupPage = router.pathname === '/admin/setup';

        if (!isAdmin && !hasHotel) {
            router.push('/'); // Guests go home
            return;
        }

        if (isAdmin && !isPlatformAdmin && !hasHotel && !isSetupPage) {
            router.push('/admin/setup');
            return;
        }

        // 🧹 Housekeeper Redirect
        const role = user?.roleAssignments?.find(r => r.hotelId === currentHotel?.id)?.role;
        if (role === 'housekeeper' && router.pathname === '/admin') {
            router.push('/admin/housekeeping');
            return;
        }

        if (isAdmin && !isPlatformAdmin && hasHotel && isSetupPage) {
            // If try to access setup but already have hotel, go dashboard
            router.push('/admin/dashboard');
            return;
        }

        const fetchNotes = () => {
            import('@/lib/api').then(({ apiFetch }) => {
                apiFetch('/notifications')
                    .then(data => setNotifications(data || []))
                    .catch(e => console.error(e))
            })
        }

        fetchNotes() // Initial load
        const interval = setInterval(fetchNotes, 60000)

        return () => clearInterval(interval)
    }, [user])

    // Handle Dark Mode
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDark = localStorage.getItem('theme') === 'dark'
            setDarkMode(isDark)
            if (isDark) document.documentElement.classList.add('dark')
        }
    }, [])

    const toggleTheme = () => {
        const newMode = !darkMode
        setDarkMode(newMode)
        localStorage.setItem('theme', newMode ? 'dark' : 'light')
        if (newMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Calendar', icon: CalendarDays, href: '/admin/calendar' },
        { name: 'Booking', icon: CalendarDays, href: '/admin/bookings' },
        { name: 'Guest', icon: UserCircle, href: '/admin/guests' },
        { name: 'Room', icon: BedDouble, href: '/admin/rooms' },
        { name: 'Rates & Avail.', icon: Filter, href: '/admin/rates' },
        { name: 'Promotions', icon: TicketPercent, href: '/admin/promotions' },
        { name: 'Reports', icon: TrendingUp, href: '/admin/reports' },
        { name: 'Payments', icon: CreditCard, href: '/admin/payments' },
        { name: 'Reviews', icon: Star, href: '/admin/reviews' },
        { name: 'Housekeeping', icon: SprayCan, href: '/admin/housekeeping' },
        { name: 'Staff Management', icon: Users, href: '/admin/staff' },
        { name: 'Message', icon: MessageSquare, href: '/admin/messages' },
        { name: 'My Account', icon: UserCircle, href: '/admin/account', section: 'bottom' },
        { name: 'Widget Gen.', icon: Globe, href: '/admin/settings/widget', section: 'bottom' },
        { name: 'Settings', icon: Settings, href: '/admin/settings', section: 'bottom' },
    ]

    if (loading) {
        return (
            <div className={`flex min-h-screen items-center justify-center font-sans ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    return (
        <div className={`flex min-h-screen font-sans text-sm transition-colors duration-200 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-56 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } bg-slate-900 text-white flex flex-col`}>
                <div className="h-16 flex items-center justify-between px-6">
                    <div className="relative">
                        <button
                            onClick={() => allHotels?.length > 1 && setHotelSwitcherOpen(!hotelSwitcherOpen)}
                            className="flex items-center gap-3 w-full text-left focus:outline-none hover:bg-slate-800 p-2 rounded-lg transition-colors -ml-2"
                        >
                            {currentHotel?.logoUrl ? (
                                <img src={currentHotel.logoUrl} alt={currentHotel.name} className="h-8 w-8 rounded object-contain bg-white shrink-0" />
                            ) : (
                                <div className="bg-emerald-500 rounded-lg p-1.5 shrink-0">
                                    <BedDouble className="text-white" size={20} />
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <span className="block text-sm font-bold text-white truncate">{currentHotel?.name || 'BookingKub'}</span>
                                {allHotels?.length > 1 && <span className="text-[10px] text-slate-400 flex items-center gap-1">Switch Hotel <ChevronDown size={10} /></span>}
                            </div>
                        </button>

                        {/* Dropdown for Platform Admin */}
                        {allHotels?.length > 1 && hotelSwitcherOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setHotelSwitcherOpen(false)} />
                                <div className="absolute top-full left-0 w-48 mt-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50">
                                    {allHotels.map(h => (
                                        <button
                                            key={h.id}
                                            onClick={() => {
                                                switchHotel(h.id);
                                                setHotelSwitcherOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-700 transition-colors ${currentHotel?.id === h.id ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
                                        >
                                            {h.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pt-2">
                    {/* Primary Navigation */}
                    {menuItems.filter(i => !i.section).filter(item => {
                        // 🔒 RBAC Logic
                        const role = user?.roleAssignments?.find(r => r.hotelId === currentHotel?.id)?.role || '';

                        // 🧹 Housekeeper Mode: Only see Housekeeping
                        if (role === 'housekeeper') {
                            return item.name === 'Housekeeping';
                        }

                        const isPlatformAdmin = user?.roles?.includes('platform_admin');
                        const isOwnerOrAdmin = ['owner', 'admin', 'hotel_admin'].includes(role) || isPlatformAdmin;

                        // Restricted items for non-admins (Reception/Manager)
                        const restricted = ['Reports', 'Payments', 'Staff Management', 'Settings'];
                        if (!isOwnerOrAdmin && restricted.includes(item.name)) return false;

                        return true;
                    }).map((item) => {
                        const isActive = router.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium mb-1 ${isActive
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        )
                    })}

                    <div className="my-4 border-t border-slate-800" />

                    {/* Settings Section */}
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 px-3 mb-2 uppercase tracking-wider">Settings</div>
                        {menuItems.filter(i => i.section === 'bottom').filter(item => {
                            // 🔒 RBAC Logic for Bottom Section
                            const role = user?.roleAssignments?.find(r => r.hotelId === currentHotel?.id)?.role || '';

                            if (role === 'housekeeper' && item.name !== 'My Account') return false;

                            const isPlatformAdmin = user?.roles?.includes('platform_admin');
                            const isOwnerOrAdmin = ['owner', 'admin', 'hotel_admin'].includes(role) || isPlatformAdmin;

                            if (!isOwnerOrAdmin && item.name === 'Settings') return false;
                            return true;
                        }).map((item) => {
                            const isActive = router.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium mb-1 ${isActive
                                        ? 'text-emerald-400 bg-slate-800'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                <div className="p-3 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-lg p-1 flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2 text-white font-medium text-xs">
                            <Moon size={16} />
                            <span>Dark Mode</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`w-8 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${darkMode ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${darkMode ? 'translate-x-3' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-56 flex flex-col min-w-0 transition-all duration-200">
                {/* Top Header */}
                <header className={`h-16 border-b flex items-center justify-between px-4 sticky top-0 z-40 backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-100'
                    }`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-500">
                            <Menu size={20} />
                        </button>
                        <a href="/" target="_blank" className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors">
                            <Globe size={16} />
                            View Website
                        </a>

                        {/* Help / Guide Button */}
                        <button
                            onClick={() => setGuideOpen(true)}
                            className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                            <HelpCircle size={18} />
                            Guide
                        </button>

                        <div className="w-full max-w-sm relative hidden lg:block">
                            <GlobalSearch />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`relative p-2 transition-colors rounded-full hover:bg-slate-100 ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {notificationsOpen && (
                                <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border overflow-hidden z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                                    }`}>
                                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                                        <button
                                            onClick={() => {
                                                import('@/lib/api').then(({ apiFetch }) => {
                                                    apiFetch('/notifications/read-all', { method: 'PUT' })
                                                        .then(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))))
                                                })
                                            }}
                                            className="text-xs text-emerald-500 font-medium hover:text-emerald-600">
                                            Mark as read
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length > 0 ? notifications.map((n, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    import('@/lib/api').then(({ apiFetch }) => {
                                                        apiFetch(`/notifications/${n.id}/read`, { method: 'PUT' })
                                                            .then(() => {
                                                                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item))
                                                            })
                                                    })
                                                }}
                                                className={`p-3 border-b last:border-0 transition-colors cursor-pointer ${n.isRead ? 'opacity-50' : 'bg-emerald-50/50 dark:bg-emerald-900/10'} hover:bg-slate-50 dark:hover:bg-slate-700 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.isRead ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        <CalendarDays size={14} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{n.title}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className="p-4 text-center text-slate-500 text-sm">No new notifications</div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`relative pl-4 border-l ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                            >
                                <div className="text-right hidden md:block">
                                    <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Admin'}</div>
                                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Admin</div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/20 ${user?.avatarUrl ? 'bg-white' : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-sm font-bold'}`}>
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.[0] || 'A'
                                    )}
                                </div>
                            </button>

                            {/* User Dropdown */}
                            {userMenuOpen && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                    <div className="p-1.5">
                                        <Link href="/admin/account" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <UserCircle size={16} />
                                            My Profile
                                        </Link>
                                        <Link href="/admin/settings" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <Settings size={16} />
                                            Settings
                                        </Link>
                                        <div className={`my-1 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Guide Modal */}
            <GuideModal
                isOpen={guideOpen}
                onClose={() => setGuideOpen(false)}
                data={currentGuide}
            />
        </div>
    )
}
