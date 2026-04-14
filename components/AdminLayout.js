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
    ChevronDown,
    Building2,
    Crown,
    Zap,
    ShieldAlert,
    Package,
    Lock,
    Info,
    Search,
    BarChart2,
    Mail,
    Share2,
    Wallet,
    Activity
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'
import { useState, useEffect } from 'react'
import GuideModal from './GuideModal'
import { guideData, defaultGuide } from '@/data/guides'
import GlobalSearch from './GlobalSearch'
import UpgradeModal from './UpgradeModal'
import NotificationMenu from './NotificationMenu'
import { useSocket } from '@/hooks/useSocket'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { toast } from 'react-hot-toast'
import { apiFetch } from '@/lib/api'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const { user, logout, loading } = useAuth()
    const [guideOpen, setGuideOpen] = useState(false)
    const {
        currentHotel, allHotels, switchHotel,
        isUpgradeModalOpen, closeUpgradeModal, openUpgradeModal,
        setSearchQuery
    } = useAdmin() || {}

    const [darkMode, setDarkMode] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [hotelSwitcherOpen, setHotelSwitcherOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadMessages, setUnreadMessages] = useState(0)

    // Fetch unread messages count
    useEffect(() => {
        if (currentHotel?.id) {
            apiFetch(`/messages/unread-count?hotelId=${currentHotel.id}`)
                .then(res => setUnreadMessages(res.count || 0))
                .catch(() => {})
        }
    }, [currentHotel?.id, router.pathname])

    // Determine current guide content
    const currentGuide = guideData[router.pathname] || defaultGuide

    // Clear search on route change
    useEffect(() => {
        if (setSearchQuery) setSearchQuery('')
    }, [router.pathname, setSearchQuery])

    const { role, hasAccess, isAdmin, isPlatformAdmin } = useRoleAccess()

    // WebSocket Integration
    const { socket, isConnected } = useSocket()

    useEffect(() => {
        if (!socket) return;

        const handleNewBooking = (booking) => {
            toast.success(`New Booking Received!\n${booking.leadName || 'Guest'} just booked.`, {
                duration: 5000,
                position: 'top-right',
            });
            // Auto reload notifications if needed, or simply append
            if (typeof setNotifications === 'function') {
                import('@/lib/api').then(({ apiFetch }) => {
                    apiFetch('/notifications').then(data => setNotifications(data || [])).catch(() => { });
                });
            }
        };

        const handleRoomStatusChanged = (data) => {
            toast(`Room ${data.roomNumber} marked as ${data.status}`, {
                icon: <SprayCan size={16} className="text-blue-600" />,
                position: 'top-right',
            });
        };

        const handleBookingUpdated = (data) => {
            let msg = `Booking #${data.bookingId} status updated to ${data.status}`;
            if (data.status === 'confirmed') toast.success(msg);
            else if (data.status === 'cancelled') toast.error(msg);
            else toast(msg, { icon: <Info size={16} className="text-blue-500" /> });
        };

        socket.on('newBooking', handleNewBooking);
        socket.on('roomStatusChanged', handleRoomStatusChanged);
        socket.on('bookingUpdated', handleBookingUpdated);

        return () => {
            socket.off('newBooking', handleNewBooking);
            socket.off('roomStatusChanged', handleRoomStatusChanged);
            socket.off('bookingUpdated', handleBookingUpdated);
        };
    }, [socket]);

    // Fetch Notifications (Poll every 30s)
    useEffect(() => {
        if (loading) return

        if (!user) {
            router.push('/auth/login');
            return;
        }

        // 🔒 RBAC Guard: Admins or Staff allowed
        const hasHotel = user.roleAssignments?.length > 0;
        const isStaffOrAdmin = isAdmin || hasHotel || isPlatformAdmin;
        const isSetupPage = router.pathname === '/admin/setup';

        // 🏨 Onboarding Check: If Admin has no Hotel, redirect to Setup
        if (!isStaffOrAdmin) {
            router.push('/'); // Guests go home
            return;
        }

        if (isAdmin && !isPlatformAdmin && !hasHotel && !isSetupPage) {
            router.push('/admin/setup');
            return;
        }

        // 🧹 Housekeeper Redirect
        if (role === 'housekeeper' && router.pathname === '/admin') {
            router.push('/admin/housekeeping');
            return;
        }

        // 🛡️ Page Level Guards based on role
        const pathSegments = router.pathname.split('/').filter(Boolean);
        const feature = pathSegments[1] || 'dashboard'; // /admin/bookings -> bookings

        if (!isPlatformAdmin && router.pathname !== '/admin/setup' && !hasAccess(feature.toLowerCase())) {
            router.push(role === 'housekeeper' ? '/admin/housekeeping' : '/admin');
            return;
        }

        if (isAdmin && !isPlatformAdmin && hasHotel && isSetupPage) {
            // If try to access setup but already have hotel, go dashboard
            router.push('/admin');
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
    }, [user, loading, router])

    // Handle Dark Mode
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDark = localStorage.getItem('theme') === 'dark'
            setDarkMode(isDark)
            if (isDark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
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
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin', group: 'Front Desk' },
        { name: 'Calendar', icon: CalendarDays, href: '/admin/calendar', group: 'Front Desk' },
        { name: 'Booking', icon: CalendarDays, href: '/admin/bookings', group: 'Front Desk' },
        { name: 'Guest', icon: UserCircle, href: '/admin/guests', group: 'Front Desk' },
        { name: 'Message', icon: MessageSquare, href: '/admin/messages', group: 'Front Desk' },

        { name: 'Room', icon: BedDouble, href: '/admin/rooms', group: 'Operations' },
        { name: 'Housekeeping', icon: SprayCan, href: '/admin/housekeeping', group: 'Operations' },
        { name: 'Staff Management', icon: Users, href: '/admin/staff', group: 'Operations' },
        ...(isAdmin || role === 'owner' ? [{ name: 'Audit Logs', icon: Settings, href: '/admin/reports/audit-logs', group: 'Operations' }] : []),

        { name: 'Rates & Avail.', icon: Filter, href: '/admin/rates', group: 'Revenue & Marketing' },
        { name: 'Yield Management', icon: Zap, href: '/admin/rates/yield', group: 'Revenue & Marketing' },
        { name: 'Promotions', icon: TicketPercent, href: '/admin/promotions', group: 'Revenue & Marketing' },
        { name: 'Reviews', icon: Star, href: '/admin/reviews', group: 'Revenue & Marketing' },
        { name: 'Analytics & SEO', icon: BarChart2, href: '/admin/reports/analytics', group: 'Revenue & Marketing' },
        { name: 'Channels', icon: Share2, href: '/admin/channels', group: 'Revenue & Marketing' },

        { name: 'Payments', icon: CreditCard, href: '/admin/payments', group: 'Finance & Analytics' },
        { name: 'Reports', icon: TrendingUp, href: '/admin/reports', group: 'Finance & Analytics' },
        { name: 'Night Audit', icon: Moon, href: '/admin/reports/night-audit', group: 'Finance & Analytics' },
        { name: 'Accounting & P/L', icon: Wallet, href: '/admin/reports/accounting', group: 'Finance & Analytics' },

        { name: 'My Account', icon: UserCircle, href: '/admin/account', section: 'bottom' },
        { name: 'Subscription', icon: Crown, href: '/admin/subscription', section: 'bottom' },
        { name: 'Widget Gen.', icon: Globe, href: '/admin/settings/widget', section: 'bottom' },
        { name: 'Settings', icon: Settings, href: '/admin/settings', section: 'bottom' },
    ]

    const superMenuItems = [
        { name: 'Platform Overview', icon: LayoutDashboard, href: '/admin' },
        { name: 'Tenants & Hotels', icon: Building2, href: '/admin/super/hotels' },
        { name: 'Platform Bookings', icon: CalendarDays, href: '/admin/super/bookings' },
        { name: 'Platform Packages', icon: Package, href: '/admin/super/packages' },
        { name: 'Platform Messages', icon: MessageSquare, href: '/admin/super/messages' },
        { name: 'Landing CMS', icon: Globe, href: '/admin/super/cms' },
        { name: 'SEO & Marketing', icon: Search, href: '/admin/super/seo' },
        { name: 'Platform Email', icon: Mail, href: '/admin/super/notifications' },
        { name: 'Platform Billing', icon: CreditCard, href: '/admin/super/billing' },
        { name: 'System Logs', icon: Activity, href: '/admin/reports/audit-logs' },
    ]

    if (loading) {
        return (
            <div className={`flex min-h-screen items-center justify-center font-sans ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className={`flex font-sans antialiased text-[13px] md:text-sm min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={closeUpgradeModal} />

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-56 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } bg-[#0f172a] text-white flex flex-col`}>
                <div className="h-16 flex items-center justify-between px-6">
                    {(!user?.roles?.includes('platform_admin') || user?.isImpersonating) ? (
                        <div className="relative">
                            <button
                                onClick={() => allHotels?.length > 1 && setHotelSwitcherOpen(!hotelSwitcherOpen)}
                                className="flex items-center gap-3 w-full text-left focus:outline-none hover:bg-white/10 p-2 rounded-lg transition-colors -ml-2"
                            >
                                {currentHotel?.logoUrl ? (
                                    <img src={currentHotel.logoUrl} alt={currentHotel.name} className="h-8 w-8 rounded object-contain bg-white shrink-0" />
                                ) : (
                                    <div className="bg-blue-600 rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                                        <img src="/logo.png" alt="BookingKub" className="h-5 w-5 object-contain brightness-0 invert" />
                                    </div>
                                )}
                                <div className="overflow-hidden">
                                    <span className="block text-sm font-bold text-white truncate">{currentHotel?.name || 'BookingKub'}</span>
                                    {allHotels?.length > 1 && <span className="text-[10px] text-slate-400 flex items-center gap-1">Switch Hotel <ChevronDown size={10} /></span>}
                                </div>
                            </button>

                            {/* Dropdown for Hotel Owners */}
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
                                                className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-700 transition-colors ${currentHotel?.id === h.id ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
                                            >
                                                {h.name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 font-black text-indigo-400 tracking-wide">
                            <ShieldAlert size={20} />
                            SUPER ADMIN
                        </div>
                    )}
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pt-2">
                    {/* Primary Navigation */}
                    {(!isPlatformAdmin || user?.isImpersonating) && (() => {
                        const allowedItems = menuItems.filter(i => !i.section).filter(item => {
                            const featureMap = {
                                'Dashboard': 'dashboard',
                                'Calendar': 'calendar',
                                'Booking': 'bookings',
                                'Housekeeping': 'housekeeping',
                                'Guest': 'guests',
                                'Room': 'rooms',
                                'Rates & Avail.': 'rates',
                                'Yield Management': 'rates', // same permission group
                                'Channels': 'rates',
                                'Promotions': 'promotions',
                                'Reviews': 'reviews',
                                'Reports': 'reports',
                                'Night Audit': 'reports',
                                'Accounting & P/L': 'reports',
                                'Payments': 'payments',
                                'Staff Management': 'staff',
                                'Audit Logs': 'staff',
                                'Message': 'messages',
                                'Analytics & SEO': 'reports'
                            };
                            
                            if (!hasAccess(featureMap[item.name])) return false;

                            // 🚀 Hide Advanced Modules for LITE package to keep sidebar clean for small hotels
                            const isLite = !currentHotel?.package || currentHotel?.package === 'LITE';
                            if (isLite) {
                                const advancedFeatures = [
                                    'Yield Management', 'Channels', 'Promotions', 'Payments',
                                    'Analytics & SEO', 'Audit Logs', 'Night Audit', 'Accounting & P/L'
                                ];
                                if (advancedFeatures.includes(item.name)) return false;
                            }

                            return true;
                        });

                        const categories = ['Front Desk', 'Operations', 'Revenue & Marketing', 'Finance & Analytics'];

                        return categories.map(cat => {
                            const catItems = allowedItems.filter(i => i.group === cat);
                            if (catItems.length === 0) return null;

                            return (
                                <div key={cat} className="mb-4">
                                    <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{cat}</div>
                                    {catItems.map((item) => {
                                        const isActive = router.pathname.startsWith(item.href) &&
                                            (item.href !== '/admin' || router.pathname === '/admin');

                                        // 🔒 Feature Locks based on Plan (For PRO users who might not have certain add-ons turned on)
                                        const isLocked = (item.name === 'Promotions' && !currentHotel?.hasPromotions) ||
                                            (item.name === 'Payments' && !currentHotel?.hasOnlinePayment) ||
                                            (item.name === 'Analytics & SEO' && !currentHotel?.hasAdvancedAnalytics);

                                        if (isLocked) {
                                            return (
                                                <button
                                                    key={item.name}
                                                    onClick={openUpgradeModal}
                                                    className="group w-full flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-all duration-300 mb-0.5 text-white/60 hover:text-white hover:bg-white/5 text-left cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
                                                        <item.icon size={18} className="text-white/50 group-hover:text-blue-400 transition-colors" />
                                                        {item.name}
                                                    </div>
                                                    <div title="Unlock this feature" className="text-amber-500 bg-amber-500/10 p-1.5 rounded-md">
                                                        <Lock size={14} />
                                                    </div>
                                                </button>
                                            )
                                        }

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`group relative flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 text-[13px] font-medium mb-0.5 overflow-hidden ${isActive
                                                    ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white font-semibold'
                                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                                                    <div className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>
                                                        <item.icon size={18} className={`transition-colors ${isActive ? 'text-blue-400' : 'text-white/50 group-hover:text-blue-400'}`} />
                                                    </div>
                                                    <span className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>{item.name}</span>
                                                </div>
                                                {item.name === 'Message' && unreadMessages > 0 && (
                                                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                                        {unreadMessages}
                                                    </span>
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )
                        });
                    })()}

                    <div className="my-4 border-t border-slate-800" />

                    {/* Platform Admin Navigation */}
                    {user?.roles?.includes('platform_admin') && !user?.isImpersonating && (
                        <div className="mb-6">
                            <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Platform Admin
                            </div>
                            {superMenuItems.map((item) => {
                                const isActive = item.href === '/admin'
                                    ? router.pathname === '/admin'
                                    : router.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-[13px] font-medium mb-0.5 overflow-hidden ${isActive
                                            ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white font-semibold'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                                        <div className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>
                                            <item.icon size={18} className={`transition-colors ${isActive ? 'text-blue-400' : 'text-white/50 group-hover:text-blue-400'}`} />
                                        </div>
                                        <span className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>{item.name}</span>
                                    </Link>
                                )
                            })}
                            <div className="my-4 border-t border-slate-800" />
                        </div>
                    )}

                    {/* Plan Badge - Minimal Vercel/Twilio style */}
                    {(!user?.roles?.includes('platform_admin') || user?.isImpersonating) && (
                        <div className="px-3 mb-6 mt-4">
                            <div className={`rounded-lg p-3 border ${currentHotel?.package === 'PRO'
                                ? 'bg-blue-900/10 border-blue-500/20'
                                : 'bg-white/5 border-white/5'
                                }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Plan</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${currentHotel?.package === 'PRO'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-white/10 text-white/60'
                                        }`}>
                                        {currentHotel?.package || 'LITE'}
                                    </span>
                                </div>
                                {currentHotel?.package !== 'PRO' && currentHotel?.package !== 'ENTERPRISE' && (
                                    <button
                                        onClick={openUpgradeModal}
                                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Zap size={12} className="fill-current" /> Upgrade to Pro
                                    </button>
                                )}
                                {currentHotel?.package === 'PRO' && currentHotel?.subscriptionEnd && (
                                    <div className="text-[10px] text-white/40 mt-1">
                                        Renews: {new Date(currentHotel.subscriptionEnd).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Section */}
                    <div>
                        {(!isPlatformAdmin || user?.isImpersonating) && hasAccess('settings') && (
                            <div className="text-[10px] font-bold text-slate-500 px-3 mb-2 uppercase tracking-wider">Settings</div>
                        )}
                        {(!isPlatformAdmin || user?.isImpersonating) && menuItems.filter(i => i.section === 'bottom').filter(item => {
                            const featureMap = {
                                'My Account': 'dashboard', // Everyone can see their account
                                'Subscription': 'subscription',
                                'Widget Gen.': 'widget',
                                'Settings': 'settings'
                            };
                            return hasAccess(featureMap[item.name]);
                        }).map((item) => {
                            const isActive = router.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-[13px] font-medium mb-0.5 overflow-hidden ${isActive
                                        ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white font-semibold'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                                    <div className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>
                                        <item.icon size={18} className={`transition-colors ${isActive ? 'text-blue-400' : 'text-white/50 group-hover:text-blue-400'}`} />
                                    </div>
                                    <span className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>{item.name}</span>
                                </Link>
                            )
                        })}

                        {isPlatformAdmin && !user?.isImpersonating && (
                            <Link
                                href="/admin/account"
                                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-[13px] font-medium mb-0.5 overflow-hidden ${router.pathname.startsWith('/admin/account')
                                    ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white font-semibold'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {router.pathname.startsWith('/admin/account') && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                                <div className={`transition-transform duration-300 ${!router.pathname.startsWith('/admin/account') ? 'group-hover:translate-x-1' : ''}`}>
                                    <UserCircle size={18} className={`transition-colors ${router.pathname.startsWith('/admin/account') ? 'text-blue-400' : 'text-white/50 group-hover:text-blue-400'}`} />
                                </div>
                                <span className={`transition-transform duration-300 ${!router.pathname.startsWith('/admin/account') ? 'group-hover:translate-x-1' : ''}`}>My Account</span>
                            </Link>
                        )}
                        
                        {/* Explore Advanced Features for LITE to replace the hidden advanced menus */}
                        {(!isPlatformAdmin || user?.isImpersonating) && (!currentHotel?.package || currentHotel?.package === 'LITE') && (
                            <button
                                onClick={openUpgradeModal}
                                className="w-full group flex items-center justify-between mt-2 px-3 py-2 rounded-lg transition-all duration-300 text-[13px] font-bold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Star size={18} />
                                    Explore Advanced
                                </div>
                                <Lock size={14} className="opacity-50" />
                            </button>
                        )}
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
                            className={`w-8 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${darkMode ? 'bg-blue-600' : 'bg-slate-600'}`}
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
                <header className={`h-14 border-b flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/95 border-slate-200'
                    }`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-500">
                            <Menu size={20} />
                        </button>

                        {(!user?.roles?.includes('platform_admin') || user?.isImpersonating) && (
                            <a href={currentHotel ? `/?hotelId=${currentHotel.id}` : '/'} target="_blank" className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                                <Globe size={15} />
                                View Website
                            </a>
                        )}

                        {/* Help / Guide Button */}
                        <button
                            onClick={() => setGuideOpen(true)}
                            className="hidden lg:flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <HelpCircle size={15} />
                            Guide
                        </button>

                        <div className="w-full max-w-sm relative hidden lg:block">
                            <GlobalSearch />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="hidden lg:block">
                            <NotificationMenu notifications={notifications} setNotifications={setNotifications} darkMode={darkMode} />
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
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-blue-600/20 ${user?.avatarUrl ? 'bg-white' : 'bg-gradient-to-tr from-blue-600 to-blue-400 text-white text-sm font-bold'}`}>
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

                <main className="flex-1 p-4 md:p-6 lg:px-8 lg:py-6 w-full max-w-[1600px] mx-auto overflow-x-hidden">
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
