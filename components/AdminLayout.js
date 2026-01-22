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
    Settings,
    Bell,
    Search,
    Moon,
    X,
    Menu,
    LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'
import { useState, useEffect } from 'react'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { searchQuery, setSearchQuery } = useAdmin() || {}
    const [darkMode, setDarkMode] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState([])

    // Fetch Notifications
    useEffect(() => {
        if (user) {
            import('@/lib/api').then(({ apiFetch }) => {
                apiFetch('/notifications').then(data => setNotifications(data)).catch(err => console.error(err))
            })
        }
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
        { name: 'Owner Management', icon: Users, href: '/admin/owners' },
        { name: 'Room', icon: BedDouble, href: '/admin/rooms' },
        { name: 'Booking', icon: CalendarDays, href: '/admin/bookings' },
        { name: 'Guest', icon: UserCircle, href: '/admin/guests' },
        { name: 'Payments', icon: CreditCard, href: '/admin/payments' },
        { name: 'Message', icon: MessageSquare, href: '/admin/messages' },
        { name: 'My Account', icon: UserCircle, href: '/admin/account', section: 'bottom' },
        { name: 'Settings', icon: Settings, href: '/admin/settings', section: 'bottom' },
    ]

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } bg-slate-900 text-white flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-emerald-500 rounded-xl p-2">
                            <BedDouble className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold text-white">BookingKub</span>
                    </Link>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {/* Primary Navigation */}
                    {menuItems.filter(i => !i.section).map((item) => {
                        const isActive = router.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${isActive
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        )
                    })}

                    <div className="my-4 border-t border-slate-800" />

                    {/* Settings Section */}
                    <div>
                        <div className="text-xs font-bold text-slate-500 px-4 mb-3 uppercase tracking-wider">Settings</div>
                        {menuItems.filter(i => i.section === 'bottom').map((item) => {
                            const isActive = router.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium mb-1 ${isActive
                                        ? 'text-emerald-400 bg-slate-800' // Different active style for secondary or keep consistent? Image implies mostly primary are green. Let's keep consistent or subtle.
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-xl p-1 flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 text-white font-medium">
                            <Moon size={18} />
                            <span>Dark Mode</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${darkMode ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-w-0 transition-all duration-200">
                {/* Top Header */}
                <header className={`h-20 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-100'
                    }`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-500">
                            <Menu size={24} />
                        </button>
                        <div className="w-full max-w-md md:w-96 relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search here..."
                                value={searchQuery || ''}
                                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 rounded-full border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors ${darkMode ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-50 text-slate-600 placeholder:text-slate-400'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`relative p-2 transition-colors rounded-full hover:bg-slate-100 ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Bell size={24} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            {/* Notification Dropdown */}
                            {notificationsOpen && (
                                <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border overflow-hidden z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                                    }`}>
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                                        <button className="text-xs text-emerald-500 font-medium">Mark as read</button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length > 0 ? notifications.map((n, i) => (
                                            <div key={i} className={`p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                                        <CalendarDays size={14} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{n.title}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{n.time || 'result'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className="p-4 text-center text-slate-500 text-sm">No new notifications</div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`relative pl-6 border-l ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                            >
                                <div className="text-right hidden md:block">
                                    <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Admin'}</div>
                                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Admin</div>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                                    {user?.name?.[0] || 'A'}
                                </div>
                            </button>

                            {/* User Dropdown */}
                            {userMenuOpen && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                    <div className="p-2">
                                        <Link href="/admin/account" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <UserCircle size={16} />
                                            My Profile
                                        </Link>
                                        <Link href="/admin/settings" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <Settings size={16} />
                                            Settings
                                        </Link>
                                        <div className={`my-1 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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

                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
