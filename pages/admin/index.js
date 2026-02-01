import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/router'
import { InfoTooltip } from '@/components/Tooltip'
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
  LogIn
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
  const { searchQuery } = useAdmin() || {}
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

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewBooking, setViewBooking] = useState(null)

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
      } else {
        fetchData() // Initial
        const interval = setInterval(() => fetchData(searchQuery, true), 30000) // Background Silent Refresh (30s)
        return () => clearInterval(interval)
      }
    }
  }, [user, authLoading, timeRange])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchData = async (search = '', isBackground = false) => {
    try {
      // Only show spinner on initial load (not background refresh or search typing)
      if (!isBackground && !bookings.length && !search) setLoading(true)

      const hotelId = user?.roleAssignments?.[0]?.hotelId;
      if (!hotelId) {
        console.warn("No Hotel ID found for user");
        return;
      }

      const statsData = await apiFetch(`/bookings/admin/dashboard?period=${timeRange}&hotelId=${hotelId}`)
      const query = search ? `?search=${search}&hotelId=${hotelId}` : `?hotelId=${hotelId}`
      const bookingsData = await apiFetch(`/bookings/admin/all${query}`)

      // preventing re-renders if data is same (Deep Compare simple approach)
      setStats(prev => (statsData && JSON.stringify(prev) !== JSON.stringify(statsData)) ? statsData : prev)
      setBookings(prev => JSON.stringify(prev) !== JSON.stringify(bookingsData) ? bookingsData : prev)

    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  // Cards Configuration
  const cards = [
    {
      label: 'Total Revenue',
      value: stats.totalRevenue ? `฿ ${stats.totalRevenue.toLocaleString()}` : '฿ 0',
      icon: DollarSign,
      color: 'bg-emerald-500',
      trend: '+12%',
      sub: 'Gross Income',
      tooltip: 'Total income from confirmed bookings (excluding cancellations).'
    },
    {
      label: 'New Bookings',
      value: stats.totalBookings || '0',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      trend: '+5',
      sub: 'Pending Confirmation',
      tooltip: 'Number of new bookings received in this period.'
    },
    {
      label: 'Today\'s Activity',
      value: `${stats.checkInsToday} / ${stats.checkOutsToday}`,
      icon: LogIn,
      color: 'bg-amber-500',
      trend: null,
      sub: 'In / Out',
      tooltip: 'Guests checking in vs checking out today.'
    },
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: 'bg-rose-500',
      trend: stats.occupancyRate > 80 ? 'High' : 'Normal',
      sub: `${stats.availableRooms} Rooms Available`,
      tooltip: 'Percentage of occupied rooms vs total inventory today.'
    },
  ]

  // Quick Onboarding Check
  const showOnboarding = stats.totalRooms === 0;

  if (authLoading || loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
      <div className="animate-pulse">Loading Dashboard...</div>
    </div>
  )

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Hotel Performance & Operations</p>
        </div>

        {/* Time Filter */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-40 justify-between shadow-sm"
          >
            <span>{periods.find(p => p.value === timeRange)?.label}</span>
            <ChevronDown size={16} />
          </button>
          {filterOpen && (
            <div className="absolute top-full mt-2 right-0 w-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
              {periods.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setTimeRange(p.value); setFilterOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 ${timeRange === p.value ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`}
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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 mb-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to your Dashboard! 🚀</h2>
              <p className="text-emerald-100 mb-6 max-w-xl">
                Your hotel system is almost ready. Complete these 3 steps to start accepting bookings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => router.push('/admin/settings')} className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                  1. Upload Logo & Images
                </button>
                <button onClick={() => router.push('/admin/rooms')} className="bg-emerald-700/50 text-white border border-emerald-400/30 px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-emerald-500/10`}>
                <item.icon size={24} />
              </div>
              {item.trend && (
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-full">
                  {item.trend}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.label}</p>
                {item.tooltip && <InfoTooltip content={item.tooltip} />}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-64 w-full">
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Occupancy Rate</h3>
          <div className="h-64 w-full">
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
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <button onClick={() => router.push('/admin/bookings')} className="text-sm font-bold text-emerald-500 hover:text-emerald-600">View All Bookings</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Ref</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Guest</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {bookings.slice(0, 5).map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">#{booking.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold dark:text-white">{booking.leadName}</p>
                    <p className="text-xs text-slate-400">{booking.roomType?.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold dark:text-white">
                    ฿{booking.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
