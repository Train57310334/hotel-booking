import { useEffect, useState } from 'react';
import {
    Activity,
    Calendar,
    ChevronDown,
    CreditCard,
    MoreHorizontal,
    Search,
    TrendingUp,
    Users,
    Bell,
    Home,
    Settings,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
    ArrowRight,
    Sparkles
} from 'lucide-react';

export default function MockDashboard({ activeView: externalActiveView }) {
    const [internalTab, setInternalTab] = useState('overview');
    const [pulse, setPulse] = useState(false);

    // If an external view is provided, use it. Otherwise, use internal state.
    const currentView = externalActiveView || internalTab;
    const isGuestView = ['booking', 'search', 'confirmation'].includes(currentView);

    // Trigger animations periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => !p);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col font-sans select-none relative group">
            {/* Fake Browser Window Header */}
            <div className="h-10 bg-slate-800/80 border-b border-slate-700/50 flex items-center px-4 gap-2">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 group-hover:bg-rose-500 transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 group-hover:bg-amber-500 transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors"></div>
                </div>
                <div className="mx-auto bg-slate-900/50 text-slate-500 text-[10px] sm:text-xs px-24 py-1 rounded-md border border-slate-700/30 flex items-center gap-2 max-w-[200px] sm:max-w-xs truncate">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
                    app.bookingkub.com
                </div>
            </div>

            <div className="flex flex-1 h-[400px] sm:h-[500px]">
                {/* Sidebar */}
                {!isGuestView && (
                    <div className="w-16 sm:w-48 bg-slate-800/20 border-r border-slate-700/50 flex flex-col p-3 transition-all duration-300 shrink-0">
                        <div className="flex items-center gap-3 px-2 mb-8 hidden sm:flex">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                B
                            </div>
                            <span className="font-bold text-slate-200 text-sm truncate">BookingKub</span>
                        </div>

                        <nav className="flex flex-col gap-2">
                            <SidebarItem icon={<Home size={18} />} label="Dashboard" active={currentView === 'overview'} onClick={() => setInternalTab('overview')} />
                            <SidebarItem icon={<Calendar size={18} />} label="Calendar" active={currentView === 'calendar'} onClick={() => setInternalTab('calendar')} />
                            <SidebarItem icon={<Users size={18} />} label="Guests" active={currentView === 'guests'} onClick={() => setInternalTab('guests')} />
                            <SidebarItem icon={<CreditCard size={18} />} label="Payments" active={currentView === 'payments'} onClick={() => setInternalTab('payments')} />
                            <SidebarItem icon={<PieChart size={18} />} label="Reports" />
                        </nav>

                        <div className="mt-auto space-y-2">
                            <SidebarItem icon={<Settings size={18} />} label="Settings" />
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 bg-slate-900/50 p-4 sm:p-6 overflow-hidden flex flex-col relative">
                    {/* Floating Glow Orbs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    {/* Dynamic View Content */}
                    {currentView === 'overview' && <OverviewView pulse={pulse} />}
                    {currentView === 'calendar' && <CalendarView pulse={pulse} />}
                    {currentView === 'guests' && <GuestsView pulse={pulse} />}
                    {currentView === 'payments' && <PaymentsView pulse={pulse} />}
                    {currentView === 'booking' && <BookingView pulse={pulse} />}
                    {currentView === 'search' && <SearchView pulse={pulse} />}
                    {currentView === 'confirmation' && <ConfirmationView pulse={pulse} />}
                </div>
            </div>

            {/* Interactive Cursor Mock */}
            <div className={`absolute w-4 h-4 rounded-full border border-white/50 pointer-events-none transition-all duration-1000 ease-in-out mix-blend-difference hidden sm:block shadow-[0_0_10px_rgba(255,255,255,0.5)] z-50
                ${pulse ? 'left-[60%] top-[40%] scale-150 opacity-100' : 'left-[70%] top-[30%] scale-100 opacity-50'}`}
                style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'invert(1)'
                }}
            ></div>
            <svg
                viewBox="0 0 24 24"
                className={`w-6 h-6 text-white absolute pointer-events-none transition-all duration-1000 ease-in-out drop-shadow-md z-50 hidden sm:block
                   ${pulse ? 'left-[60%] top-[40%] translate-x-2 translate-y-2 rotate-12' : 'left-[70%] top-[30%] rotate-0'}`}
                fill="currentColor"
            >
                <path d="M4 4l16 6-7 2-3 8z" stroke="rgba(0,0,0,0.5)" strokeWidth="1" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

// ----------------------------------------------------------------------
// Dynamic View Components
// ----------------------------------------------------------------------

function OverviewView({ pulse }) {
    return (
        <div className="flex flex-col h-full animate-fade-in-up">
            {/* Topbar */}
            <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
                <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Welcome back, Admin <Sparkles className="inline-block pb-1" size={20} /></h2>
                    <p className="text-xs sm:text-sm text-slate-400">Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
                        <Bell size={16} />
                        <span className={`absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border-2 border-slate-900 ${pulse ? 'animate-ping opacity-75' : ''}`}></span>
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border-2 border-slate-900"></span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border-2 border-slate-800 shadow-sm">
                        <span className="text-white text-xs font-bold">A</span>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 relative z-10">
                <StatCard title="Total Revenue" value="฿124,500" trend="+12.5%" isUp delay={100} pulse={pulse} />
                <StatCard title="Occupancy" value="85%" trend="+5.2%" isUp delay={200} />
                <StatCard title="New Bookings" value="24" trend="-2.1%" delay={300} />
                <StatCard title="ADR" value="฿3,200" trend="+8.4%" isUp delay={400} />
            </div>

            {/* Charts / Activity Area */}
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 flex-1 relative z-10">
                {/* Main Chart Placeholder */}
                <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 sm:p-5 flex flex-col relative overflow-hidden group/chart">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <Activity size={16} className="text-primary-400" />
                            Revenue Overview
                        </h3>
                        <div className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                            This Week <ChevronDown size={12} />
                        </div>
                    </div>

                    {/* Animated SVG Chart Line */}
                    <div className="flex-1 w-full relative mt-2">
                        {/* Grid lines background */}
                        <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-full h-px bg-slate-600"></div>
                            ))}
                        </div>
                        <svg className="w-full h-full text-primary-500 preserve-3d" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradientPrefix" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Area fill */}
                            <path
                                d="M0 50 L0 30 C10 20, 20 40, 30 25 C40 10, 50 35, 60 20 C70 5, 80 25, 90 15 L100 10 L100 50 Z"
                                fill="url(#gradientPrefix)"
                                className="transition-all duration-1000 ease-in-out"
                                style={{ transform: pulse ? 'translateY(2px) scaleY(0.95)' : 'translateY(0) scaleY(1)' }}
                            />
                            {/* Line */}
                            <path
                                d="M0 30 C10 20, 20 40, 30 25 C40 10, 50 35, 60 20 C70 5, 80 25, 90 15 L100 10"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="animate-dash"
                                style={{ strokeDasharray: 200, strokeDashoffset: pulse ? 10 : 0, transition: 'stroke-dashoffset 3s ease-in-out' }}
                            />
                            {/* Pulsing Dot */}
                            <circle cx="100" cy="10" r="1.5" fill="currentColor">
                                <animate attributeName="r" values="1.5; 3; 1.5" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="1; 0.5; 1" dur="2s" repeatCount="indefinite" />
                            </circle>
                        </svg>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 sm:p-5 flex flex-col hidden sm:flex">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-200">Recent Bookings</h3>
                        <button className="text-slate-400 hover:text-white"><MoreHorizontal size={16} /></button>
                    </div>
                    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                        <ActivityItem name="Sarah Jenkins" room="Deluxe Suite" time="2m ago" amount="฿4,500" status="confirmed" />
                        <ActivityItem name="Mike Ross" room="Standard Double" time="15m ago" amount="฿2,100" status="pending" />
                        <ActivityItem name="Elena Gilbert" room="Ocean View" time="1h ago" amount="฿6,800" status="confirmed" />
                        <ActivityItem name="Stefan Salv." room="Standard Twin" time="2h ago" amount="฿2,000" status="confirmed" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CalendarView({ pulse }) {
    return (
        <div className="flex flex-col h-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Booking Calendar</h2>
                    <p className="text-xs sm:text-sm text-slate-400">Drag and drop to manage availability.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1 text-xs font-bold bg-slate-800 text-slate-300 rounded-md border border-slate-700">Today</div>
                    <div className="flex bg-slate-800 border border-slate-700 rounded-md overflow-hidden">
                        <button className="px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700">&lt;</button>
                        <button className="px-3 py-1 text-xs font-bold text-slate-300 border-l border-slate-700 hover:bg-slate-700">&gt;</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col relative z-10">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 border-b border-slate-700/50 bg-slate-800/40">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <div key={i} className="py-2 text-center text-[10px] sm:text-xs font-bold text-slate-400 border-r border-slate-700/30 last:border-r-0">
                            {d} <span className="text-slate-500 font-normal hidden sm:inline">{i + 14}</span>
                        </div>
                    ))}
                </div>
                {/* Calendar Content Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-4 relative">
                    {/* Grid Lines */}
                    {[...Array(28)].map((_, i) => (
                        <div key={i} className="border-r border-b border-slate-800/50"></div>
                    ))}

                    {/* Mock Bookings */}
                    <div className={`absolute top-[5%] left-[14.28%] w-[25%] h-[20%] bg-blue-500/20 border border-blue-500/50 rounded-md p-1 sm:p-2 m-1 transition-all duration-500 ${pulse ? 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}>
                        <div className="text-[8px] sm:text-[10px] font-bold text-blue-400 truncate">John Smith</div>
                        <div className="text-[8px] text-blue-500/80 hidden sm:block truncate">Standard Double</div>
                    </div>

                    <div className="absolute top-[30%] left-[42.85%] w-[40%] h-[20%] bg-emerald-500/20 border border-emerald-500/50 rounded-md p-1 sm:p-2 m-1">
                        <div className="text-[8px] sm:text-[10px] font-bold text-emerald-400 truncate">Sarah Connor</div>
                        <div className="text-[8px] text-emerald-500/80 hidden sm:block truncate">Ocean View Suite</div>
                    </div>

                    <div className="absolute top-[55%] left-[28.57%] w-[14%] h-[20%] bg-amber-500/20 border border-amber-500/50 rounded-md p-1 sm:p-2 m-1">
                        <div className="text-[8px] sm:text-[10px] font-bold text-amber-400 truncate">Bruce W.</div>
                        <div className="text-[8px] text-amber-500/80 hidden sm:block truncate">Penthouse</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GuestsView({ pulse }) {
    return (
        <div className="flex flex-col h-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Guest Directory</h2>
                    <p className="text-xs sm:text-sm text-slate-400">Manage profiles and history.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                        <Search size={14} className="text-slate-500" /> Search...
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col relative z-10">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/80 text-xs text-slate-300 border-b border-slate-700/50">
                        <tr>
                            <th className="px-4 py-3 font-bold">Name</th>
                            <th className="px-4 py-3 font-bold hidden sm:table-cell">Email</th>
                            <th className="px-4 py-3 font-bold">Total Spent</th>
                            <th className="px-4 py-3 font-bold hidden sm:table-cell">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        <tr className={`hover:bg-slate-800/50 transition-colors ${pulse ? 'bg-primary-500/5' : ''}`}>
                            <td className="px-4 py-3 font-medium text-slate-200">Alex Johnson</td>
                            <td className="px-4 py-3 hidden sm:table-cell">alex@example.com</td>
                            <td className="px-4 py-3 font-medium text-primary-400">฿12,400</td>
                            <td className="px-4 py-3 hidden sm:table-cell"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs">VIP</span></td>
                        </tr>
                        <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-200">Maria Garcia</td>
                            <td className="px-4 py-3 hidden sm:table-cell">m.garcia@mail.com</td>
                            <td className="px-4 py-3 font-medium text-primary-400">฿4,200</td>
                            <td className="px-4 py-3 hidden sm:table-cell"><span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">Standard</span></td>
                        </tr>
                        <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-200">James Smith</td>
                            <td className="px-4 py-3 hidden sm:table-cell">j.smith@web.com</td>
                            <td className="px-4 py-3 font-medium text-primary-400">฿8,900</td>
                            <td className="px-4 py-3 hidden sm:table-cell"><span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">Standard</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PaymentsView({ pulse }) {
    return (
        <div className="flex flex-col h-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Financials</h2>
                    <p className="text-xs sm:text-sm text-slate-400">Track revenue and payouts.</p>
                </div>
                <div className="px-3 py-1.5 text-xs font-bold text-primary-400 bg-primary-500/10 rounded-md border border-primary-500/20">
                    Export CSV
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                    <h4 className="text-xs font-medium text-slate-500 mb-2">Available to Payout</h4>
                    <div className="text-3xl font-bold text-white tracking-tight">฿42,500</div>
                    <div className="mt-4 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-primary-500 transition-all duration-1000 ${pulse ? 'w-2/3' : 'w-1/2'}`}></div>
                    </div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                    <h4 className="text-xs font-medium text-slate-500 mb-2">Pending Clearance</h4>
                    <div className="text-3xl font-bold text-slate-300 tracking-tight">฿14,200</div>
                    <div className="mt-4 flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[10px] text-slate-400">Processing via Stripe</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 overflow-hidden relative z-10">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400"><TrendingUp size={14} /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200">Payout to Bank ****4092</div>
                                <div className="text-[10px] text-slate-500">Today, 2:30 PM</div>
                            </div>
                        </div>
                        <div className="text-sm font-bold text-emerald-400">฿10,000</div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400"><CreditCard size={14} /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200">Payment: Booking #1042</div>
                                <div className="text-[10px] text-slate-500">Yesterday, 10:15 AM</div>
                            </div>
                        </div>
                        <div className="text-sm font-bold text-white">+฿2,500</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookingView({ pulse }) {
    return (
        <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden animate-fade-in-up">
            {/* Guest Header */}
            <div className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-6 sticky top-0 z-20">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded bg-primary-600 text-white flex items-center justify-center text-xs transition-transform duration-500 ${pulse ? 'rotate-12 scale-110 shadow-sm' : ''}`}>B</div>
                    The Riverside Hotel
                </div>
                <div className="text-sm font-medium text-slate-500 hidden sm:block">My Bookings</div>
            </div>

            <div className="flex-1 flex overflow-hidden p-0 relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 overflow-y-auto scrollbar-hide relative z-10">
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mb-4">Checkout</h2>
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-200/40 border border-slate-100 mb-4 group">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm sm:text-base"><div className="w-2 h-2 rounded-full bg-primary-500" /> Guest Details</h3>
                        <div className="space-y-3">
                            <div className="relative group/input">
                                <input type="text" placeholder="Chaiwat S." className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm text-sm" readOnly />
                            </div>
                            <div className="relative group/input">
                                <input type="email" placeholder="chaiwat@example.com" className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm text-sm" readOnly />
                            </div>
                        </div>
                    </div>

                    <button className={`w-full py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 relative overflow-hidden group transition-all duration-300 ${pulse ? 'scale-[1.02] shadow-[0_12px_25px_-6px_rgba(59,130,246,0.7)]' : ''}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />
                        Continue to Payment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function SearchView({ pulse }) {
    return (
        <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden animate-fade-in-up">
            <div className="h-14 bg-white border-b flex justify-between items-center px-6 shrink-0 z-10">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded bg-primary-600 text-white flex items-center justify-center text-xs transition-transform duration-500`}>B</div>
                    The Riverside Hotel
                </div>
                <div className="flex gap-4 text-sm font-medium">
                    <span className="text-primary-600 border-b-2 border-primary-600 pb-4 mt-4">Search Results</span>
                    <span className="text-slate-400 pb-4 mt-4 hidden sm:block">My Bookings</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-4 sm:p-6 gap-6 relative">
                {/* Filters Sidebar */}
                <div className="w-40 hidden md:flex flex-col gap-6 shrink-0">
                    <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-sm">Price Range</h4>
                        <div className="h-1.5 bg-slate-200 rounded-full w-full mb-3">
                            <div className={`h-full bg-primary-500 rounded-full relative transition-all duration-1000 ${pulse ? 'w-3/4' : 'w-1/2'}`}>
                                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full transition-transform duration-500 ${pulse ? 'scale-110 shadow-md' : 'scale-100'}`}></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>฿1,000</span>
                            <span>฿5,000+</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-sm">Amenities</h4>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer"><div className="w-4 h-4 rounded bg-primary-500 flex items-center justify-center text-white"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div> Free WiFi</label>
                            <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer"><div className="w-4 h-4 rounded bg-primary-500 flex items-center justify-center text-white"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div> Pool</label>
                            <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer"><div className="w-4 h-4 rounded border border-slate-300"></div> Spa</label>
                            <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer"><div className="w-4 h-4 rounded border border-slate-300"></div> Gym</label>
                        </div>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4 pr-1 sm:pr-2 scrollbar-hide">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">2 Rooms Available</h3>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                            <Calendar size={14} className="text-primary-500" /> Dec 24 - Dec 27
                        </div>
                    </div>

                    {/* Result 1 */}
                    <div className={`bg-white border-2 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 group relative ${pulse ? 'border-primary-400 shadow-[0_8px_30px_-6px_rgba(59,130,246,0.3)] scale-[1.01]' : 'border-slate-100'}`}>
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-primary-500 transition-colors z-10" />
                        <div className="w-full h-32 sm:h-36 bg-slate-200 shrink-0 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1470&auto=format&fit=crop" className={`w-full h-full object-cover transition-transform duration-700 ${pulse ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <div className="absolute top-3 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded shadow-sm text-[10px] font-bold text-primary-700">Highly Recommended</div>
                        </div>
                        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between pl-4 sm:pl-5">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h4 className={`font-bold text-base sm:text-lg leading-tight transition-colors ${pulse ? 'text-primary-600' : 'text-slate-900 group-hover:text-primary-600'}`}>Executive River View</h4>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                                        <span className="flex items-center gap-1"><Users size={12} className="text-primary-400" /> 2 Guests</span> • <span className="flex items-center gap-1"><Home size={12} className="text-primary-400" /> 42 sqm</span>
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600 font-black text-xl sm:text-2xl leading-none">฿3,800</div>
                                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">/ night</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] sm:text-[10px] font-bold rounded-lg flex items-center gap-1"><CheckCircle size={10} /> Free Breakfast</span>
                                </div>
                                <button className={`bg-primary-600 text-white text-[11px] sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-xl transition-all duration-300 relative overflow-hidden flex items-center gap-1 ${pulse ? 'shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)]' : 'group-hover:shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)]'}`}>
                                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] ${pulse ? 'animate-shine' : 'group-hover:animate-shine'}`} />
                                    Select
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Result 2 */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full h-28 sm:h-32 bg-slate-200 shrink-0">
                            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">Presidential Suite</h4>
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">2 King Beds • Private Pool • 120 sqm</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-slate-900 font-bold text-lg sm:text-xl leading-none">฿12,500</div>
                                    <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">/ night</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end mt-3">
                                <div className="flex flex-wrap gap-1.5">
                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-bold rounded">Free Breakfast</span>
                                </div>
                                <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
                                    Select
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConfirmationView({ pulse }) {
    return (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in-up relative overflow-hidden">
            {/* Deep Mesh Gradients */}
            <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none transition-all duration-1000 ${pulse ? 'scale-110 translate-x-4' : ''}`} />
            <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-500/20 rounded-full blur-[80px] pointer-events-none transition-all duration-1000 ${pulse ? 'scale-110 -translate-x-4' : ''}`} />

            <div className={`bg-white rounded-[2rem] shadow-2xl border border-slate-200/60 p-5 max-w-sm w-full text-center transition-all duration-1000 relative z-10 ${pulse ? 'scale-[1.02] shadow-emerald-500/20' : 'scale-100'}`}>
                <div className="inline-block relative mb-4">
                    <div className={`absolute inset-0 rounded-full blur-xl bg-emerald-500/30 transition-opacity duration-1000 ${pulse ? 'opacity-100 animate-pulse' : 'opacity-50'}`} />
                    <div className="w-14 h-14 bg-gradient-to-b from-emerald-400/20 to-emerald-400/10 border border-emerald-400/30 backdrop-blur-xl rounded-full flex items-center justify-center relative shadow-lg">
                        <CheckCircle size={28} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                    </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 mb-1 tracking-tight">Booking Confirmed!</h2>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-4 leading-relaxed px-2">Thank you for choosing The Riverside Hotel. Your itinerary has been sent to your email.</p>

                <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-4 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400" />
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Booking Ref</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 tracking-tight">BKG-7742</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500">Check-in</span>
                            <span className="text-sm font-bold text-slate-900">Dec 24, 14:00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500">Check-out</span>
                            <span className="text-sm font-bold text-slate-900">Dec 27, 12:00</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total Paid</span>
                    <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600 font-display">฿11,400</span>
                </div>

                <button className={`w-full bg-[#1C58EA] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden shadow-[0_8px_20px_-6px_rgba(28,88,234,0.6)] ${pulse ? 'shadow-[0_12px_25px_-6px_rgba(28,88,234,0.8)]' : 'hover:bg-[#1642b3]'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] ${pulse ? 'animate-shine' : 'group-hover:animate-shine'}`} />
                    View Details <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Small Helper Components
// ----------------------------------------------------------------------

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${active ? 'bg-primary-500/20 text-primary-400 font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

function StatCard({ title, value, trend, isUp, delay, pulse }) {
    return (
        <div
            className={`bg-slate-800/40 border ${pulse ? 'border-primary-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-700/50'} rounded-xl p-3 sm:p-4 animate-fade-in-up transition-all duration-1000`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <h4 className="text-xs font-medium text-slate-400 mb-1">{title}</h4>
            <div className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">{value}</div>
            <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                {trend}
            </div>
        </div>
    );
}

function ActivityItem({ name, room, time, amount, status }) {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {name.charAt(0)}
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-200">{name}</div>
                    <div className="text-[10px] text-slate-500">{room} • {time}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs font-bold text-white">{amount}</div>
                <div className={`text-[10px] font-medium ${status === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {status}
                </div>
            </div>
        </div>
    );
}
