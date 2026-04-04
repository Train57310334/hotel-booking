import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/router'
import { InfoTooltip } from '@/components/Tooltip'
import BookingDetailModal from '@/components/BookingDetailModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import SuperAdminDashboard from '@/components/SuperAdminDashboard'
import toast from 'react-hot-toast'

import {
  BarChart as BarChartIcon,
  Users,
  Calendar as CalendarIcon,
  DollarSign,
  CheckCircle,
  LogOut,
  TrendingUp,
  Search,
  Filter,
  Download,
  ChevronDown,
  Eye,
  Trash2,
  BedDouble,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
  LogIn,
  Rocket
} from 'lucide-react'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'


export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { searchQuery, currentHotel } = useAdmin() || {}  // ✅ Always call hooks at component top level
  const router = useRouter()

  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    chartData: [],
    occupancyChart: [],
    totalRooms: 0,
    availableRooms: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    occupancyRate: 0
  })

  const [dailyOps, setDailyOps] = useState({ arrivals: [], departures: [], inHouse: [], urgentCleaning: [] })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [filterOpen, setFilterOpen] = useState(false)

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => { }
  })


  const periods = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' }
  ]

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
      } else if (!user.roles?.includes('platform_admin')) {
        // Only fetch hotel dashboard data for non-super-admins
        fetchData()
        const interval = setInterval(() => fetchData(searchQuery, true), 30000)
        return () => clearInterval(interval)
      } else {
        // Super Admin: no hotel data needed, stop loading immediately
        setLoading(false)
      }
    }
  }, [user, authLoading, timeRange])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery, currentHotel?.id])

  const fetchData = async (search = '', isBackground = false) => {
    try {
      // Super Admin uses their own dashboard — skip hotel-scoped data fetch
      if (user?.roles?.includes('platform_admin')) return;

      // Only show spinner on initial load (not background refresh or search typing)
      if (!isBackground && !bookings.length && !search) setLoading(true)

      // ✅ Use currentHotel from component scope — do NOT call useAdmin() inside a function
      const hotelId = currentHotel?.id;

      if (!hotelId) {
        console.warn("No Hotel ID found in context");
        setLoading(false);
        return;
      }

      const statsData = await apiFetch(`/bookings/admin/dashboard?period=${timeRange}&hotelId=${hotelId}`)
      const query = search ? `?search=${search}&hotelId=${hotelId}` : `?hotelId=${hotelId}`
      const bookingsData = await apiFetch(`/bookings/admin/all${query}`)
      const dailyOpsData = await apiFetch(`/bookings/admin/daily-operations?hotelId=${hotelId}`)

      // preventing re-renders if data is same (Deep Compare simple approach)
      // API returns { data: [...], meta: {...} } — unwrap the array
      const bookingsList = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.data || [])
      setStats(prev => (statsData && JSON.stringify(prev) !== JSON.stringify(statsData)) ? statsData : prev)
      setBookings(prev => JSON.stringify(prev) !== JSON.stringify(bookingsList) ? bookingsList : prev)
      setDailyOps(prev => (dailyOpsData && JSON.stringify(prev) !== JSON.stringify(dailyOpsData)) ? dailyOpsData : prev)


    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  // Helpers
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + "y ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + "mo ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + "d ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + "m ago";
    return "Just now";
  }

  const openDetails = (booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const updateStatus = (id, newStatus) => {
    setConfirmModal({
      isOpen: true,
      title: 'Update Booking Status',
      message: `Are you sure you want to change status to "${newStatus}" ? `,
      type: newStatus === 'cancelled' ? 'danger' : 'warning',
      onConfirm: async () => {
        try {
          const hotelId = user?.roleAssignments?.[0]?.hotelId;
          const query = hotelId ? `? hotelId = ${hotelId} ` : '';

          await apiFetch(`/ bookings / admin / ${id}/status${query}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
          fetchData(searchQuery) // Refresh dashboard
          setIsDetailOpen(false)
        } catch (error) {
          toast.error('Update failed')
        }
      }
    })
  }

  // Cards Configuration
  const cards = [
    {
      label: 'Total Revenue',
      value: stats.totalRevenue ? `฿ ${stats.totalRevenue.toLocaleString()}` : '฿ 0',
      icon: DollarSign,
      color: 'bg-blue-500',
      trend: '+12%',
      sub: 'Gross Income',
      tooltip: 'Sum of the room charges from all Confirmed, Checked-In, and Checked-Out bookings in the selected time period. Cancellations and Pending bookings are excluded.'
    },
    {
      label: 'New Bookings',
      value: stats.totalBookings || '0',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      trend: '+5',
      sub: 'Pending Confirmation',
      tooltip: 'Total number of booking reservations created in this period, across all statuses (Pending, Confirmed, Checked In, Checked Out). Does not include cancellations.'
    },
    {
      label: 'Today\'s Activity',
      value: `${stats.checkInsToday} / ${stats.checkOutsToday}`,
      icon: LogIn,
      color: 'bg-amber-500',
      trend: null,
      sub: 'In / Out',
      tooltip: 'Left number = guests arriving today (Check-In). Right number = guests departing today (Check-Out). Use this to brief your front desk and housekeeping teams each morning.'
    },
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: 'bg-rose-500',
      trend: stats.occupancyRate > 80 ? 'High' : 'Normal',
      sub: `${stats.availableRooms} Rooms Available`,
      tooltip: 'Calculated as: Occupied Rooms ÷ Total Active Rooms × 100%. A healthy occupancy is typically 70–85%. Data updates every 30 seconds.'
    },
  ]

  // Quick Onboarding Check
  const showOnboarding = stats.totalRooms === 0;

  // ── Super Admin check FIRST (before any loading screen) ──────────────────
  if (!authLoading && user?.roles?.includes('platform_admin') && !user?.isImpersonating) {
    return (
      <AdminLayout>
        <SuperAdminDashboard />
      </AdminLayout>
    );
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-8 h-8 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="text-sm font-medium">Loading Dashboard...</div>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hotel Performance & Operations</p>
        </div>

        {/* Time Filter */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-36 justify-between shadow-sm"
          >
            <span>{periods.find(p => p.value === timeRange)?.label}</span>
            <ChevronDown size={14} />
          </button>
          {filterOpen && (
            <div className="absolute top-full mt-2 right-0 w-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
              {periods.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setTimeRange(p.value); setFilterOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 ${timeRange === p.value ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Widget */}
      {showOnboarding && (
        <div className="bg-gradient-to-r from-blue-500 to-teal-600 rounded-3xl p-8 mb-4 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to your Dashboard! <Rocket className="inline-block pb-1" size={24} /></h2>
              <p className="text-blue-100 mb-6 max-w-xl">
                Your hotel system is almost ready. Complete these 3 steps to start accepting bookings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => router.push('/admin/settings')} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                  1. Upload Logo & Images
                </button>
                <button onClick={() => router.push('/admin/rooms')} className="bg-blue-700/50 text-white border border-blue-400/30 px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  2. Create Room Types
                </button>
              </div>
            </div>
            <div className="hidden md:block opacity-20 transform scale-150 rotate-12 bg-white/30 rounded-full p-12">
              <Home size={120} />
            </div>
          </div>
        </div>
      )}

      {/* Today's Overview */}
      {!showOnboarding && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Today's Overview ⚡</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Arrivals */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-l-4 border-blue-500 shadow-sm flex flex-col h-48">
              <div className="flex justify-between items-start mb-2 shrink-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arrivals</p>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold px-2 py-0.5 rounded text-xs">
                  {dailyOps?.arrivals?.length || 0}
                </span>
              </div>
              <div className="space-y-2 mt-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {(!dailyOps?.arrivals || dailyOps.arrivals.length === 0) ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No arrivals.</div>
                ) : dailyOps.arrivals.map(b => (
                  <div key={b.id} onClick={() => openDetails(b)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg flex justify-between items-center group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{b.leadName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{b.roomType?.name}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Departures */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-l-4 border-amber-500 shadow-sm flex flex-col h-48">
              <div className="flex justify-between items-start mb-2 shrink-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departures</p>
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-xs">
                  {dailyOps?.departures?.length || 0}
                </span>
              </div>
              <div className="space-y-2 mt-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {(!dailyOps?.departures || dailyOps.departures.length === 0) ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No departures.</div>
                ) : dailyOps.departures.map(b => (
                  <div key={b.id} onClick={() => openDetails(b)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg flex justify-between items-center group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{b.leadName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{b.room?.roomNumber ? `Room ${b.room.roomNumber}` : 'Unassigned'}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* In-House */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-l-4 border-emerald-500 shadow-sm flex flex-col h-48">
              <div className="flex justify-between items-start mb-2 shrink-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In-House</p>
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-xs">
                  {dailyOps?.inHouse?.length || 0}
                </span>
              </div>
              <div className="space-y-2 mt-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {(!dailyOps?.inHouse || dailyOps.inHouse.length === 0) ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No guests.</div>
                ) : dailyOps.inHouse.map(b => (
                  <div key={b.id} onClick={() => openDetails(b)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg flex justify-between items-center group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{b.leadName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{b.room?.roomNumber ? `Room ${b.room.roomNumber}` : 'Unassigned'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent Cleaning */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-l-4 border-rose-500 shadow-sm flex flex-col h-48">
              <div className="flex justify-between items-start mb-2 shrink-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgent Cleaning</p>
                <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold px-2 py-0.5 rounded text-xs">
                  {dailyOps?.urgentCleaning?.length || 0}
                </span>
              </div>
              <div className="space-y-2 mt-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {(!dailyOps?.urgentCleaning || dailyOps.urgentCleaning.length === 0) ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">All rooms clean.</div>
                ) : dailyOps.urgentCleaning.map(r => (
                  <div key={r.id} className="p-2 rounded-lg flex justify-between items-center group border border-transparent bg-slate-50 dark:bg-slate-700/30 border-slate-100 dark:border-slate-700">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">Room {r.roomNumber}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{r.roomType?.name}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Dirty</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {cards.map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
              <item.icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{item.label}</p>
                {item.tooltip && <InfoTooltip content={item.tooltip} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{item.value}</h3>
              <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>
            </div>
            {item.trend && (
              <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{item.trend}</span>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Revenue Trend</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Occupancy Rate</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.occupancyChart}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <button onClick={() => router.push('/admin/bookings')} className="text-xs font-bold text-blue-500 hover:text-blue-600">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase">Ref</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase">Guest</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase">Time</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {bookings.slice(0, 5).map(booking => (
                <tr
                  key={booking.id}
                  onClick={() => openDetails(booking)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-500">#{booking.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-2.5">
                    <p className="text-xs font-bold dark:text-white">{booking.leadName}</p>
                    <p className="text-xs text-slate-400">{booking.roomType?.name}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {timeAgo(booking.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400' :
                        booking.status === 'checked_in' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-bold dark:text-white">
                    ฿{booking.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDetailOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setIsDetailOpen(false)}
          onUpdateStatus={updateStatus}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
      />
    </AdminLayout>
  )
}

