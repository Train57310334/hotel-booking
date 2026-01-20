import Link from 'next/link'
import { useRouter } from 'next/router'
import {
    LayoutDashboard,
    Users,
    BedDouble,
    CalendarDays,
    CreditCard,
    MessageSquare,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/account/dashboard' },
        { name: 'Owner Management', icon: Users, href: '/account/owners' },
        { name: 'Room', icon: BedDouble, href: '/account/rooms' },
        { name: 'Booking', icon: CalendarDays, href: '/account/bookings' },
        { name: 'Guest', icon: Users, href: '/account/guests' },
        { name: 'Payments', icon: CreditCard, href: '/account/payments' },
        { name: 'Message', icon: MessageSquare, href: '/account/messages' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
            >
                <div className="h-16 flex items-center justify-center border-b border-slate-100">
                    <span className={`font-display font-bold text-xl text-primary-600 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        BookingKub
                    </span>
                    {!sidebarOpen && <span className="font-display font-bold text-xl text-primary-600">BK</span>}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = router.pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }
                `}
                            >
                                <item.icon size={20} className={isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        )
                    })}

                    <div className="my-6 border-t border-slate-100 mx-2" />

                    <Link href="/account/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <Users size={20} />
                        {sidebarOpen && <span>My Account</span>}
                    </Link>
                    <Link href="/account/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <Settings size={20} />
                        {sidebarOpen && <span>Settings</span>}
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <Menu size={20} />
                        {sidebarOpen && <span className="text-sm">Collapse Sidebar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2 w-64 border border-slate-100 focus-within:border-primary-300 transition-colors">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none text-sm ml-2 w-full focus:ring-0 outline-none text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-slate-700 leading-none">Watt Banana</p>
                                <p className="text-xs text-slate-400 mt-1">Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
