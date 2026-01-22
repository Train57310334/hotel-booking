import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/router'
import {
  BarChart as BarChartIcon,
  Users,
  Calendar as CalendarIcon,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Trash2,
  BedDouble,
  Home,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { searchQuery } = useAdmin() || {} // Global search state
  const router = useRouter()
  // Initial state matches API response structure
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    chartData: [],
    totalRooms: 0,
    availableRooms: 0
  })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(21) // Mock initial selected date
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData, setCalendarData] = useState([])

  // Modal State
  const [viewBooking, setViewBooking] = useState(null)

  // Filter State
  const [timeRange, setTimeRange] = useState('month')
  const [filterOpen, setFilterOpen] = useState(false)

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
        // Fetch initially
        fetchData()
        fetchCalendarData()
      }
    }
  }, [user, authLoading, timeRange]) // Fetch when timeRange changes

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchData = async (search = '') => {
    try {
      // Don't show loading on search typing to prevent flashing, just update list
      // But initial load should show loading.
      if (!bookings.length) setLoading(true)

      const statsData = await apiFetch(`/bookings/admin/dashboard?period=${timeRange}`)
      // Pass search param if exists
      const query = search ? `?search=${search}` : ''
      const bookingsData = await apiFetch(`/bookings/admin/all${query}`)

      setStats(statsData)
      setBookings(bookingsData)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCalendarData = async () => {
    try {
      // Just fetch for current month for now. In real app, listen to currentMonth change.
      const data = await apiFetch('/bookings/admin/calendar')
      setCalendarData(data)
    } catch (e) { console.error(e) }
  }

  const handleAction = async (action, bookingId) => {
    if (action === 'delete') {
      if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
      try {
        // Use the new Admin-specific cancel endpoint
        await apiFetch(`/bookings/admin/${bookingId}/cancel`, { method: 'PUT' })
        fetchData(searchQuery) // Refresh data
        alert('Booking cancelled successfully.')
      } catch (e) { alert('Failed to cancel: ' + e.message) }
    } else if (action === 'view') {
      // Find booking in local state (or fetch detail)
      const booking = bookings.find(b => b.id === bookingId)
      if (booking) setViewBooking(booking)
    }
  }

  const handleDownload = () => {
    // Simple CSV Export
    if (!bookings.length) return;
    const headers = ['Booking ID', 'Guest Name', 'Email', 'Check In', 'Check Out', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...bookings.map(b => [
        b.id,
        `"${b.leadName || b.user?.name}"`,
        b.leadEmail || b.user?.email,
        new Date(b.checkIn).toISOString().split('T')[0],
        new Date(b.checkOut).toISOString().split('T')[0],
        b.totalAmount,
        b.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Use real data or fallback for chart
  const revenueData = stats.chartData?.length ? stats.chartData : [
    { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
    { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
  ]

  // Mock calendar days generator (Using backend data if available would be better, but this visuals works)
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Days
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }

  const calendarDays = getDaysInMonth(currentMonth);

  if (authLoading || loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
      <div className="animate-pulse">Loading...</div>
    </div>
  )

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Welcome, {user?.name?.split(' ')[0] || 'Admin'}</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome to BookingKub, Manage your hotel booking data with us</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-40 justify-between"
            >
              <span>{periods.find(p => p.value === timeRange)?.label}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterOpen && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
                {periods.map(p => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setTimeRange(p.value)
                      setFilterOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${timeRange === p.value
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95 transform duration-150">
            Download <Download size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: stats.totalRevenue ? `฿ ${stats.totalRevenue.toLocaleString()}` : '฿ 0', icon: DollarSign, color: 'bg-emerald-500', trend: '+12%' },
          { label: 'Total Rooms', value: stats.totalRooms, icon: Home, color: 'bg-blue-500', trend: null },
          { label: 'Available Rooms', value: stats.availableRooms, icon: BedDouble, color: 'bg-indigo-500', trend: '-2' },
          { label: 'New Bookings', value: stats.totalBookings || '0', icon: CalendarIcon, color: 'bg-rose-500', trend: '+5' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-emerald-500/10`}>
                <item.icon size={24} />
              </div>
              {item.trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.trend.startsWith('+')
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                  {item.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{item.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Stats */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Statistics</h3>
            <button className="text-sm px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 flex items-center gap-1">
              This Month <ChevronDown size={14} />
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  activeDot={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(val) => `฿${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#10b981' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Schedule (Mini Calendar) */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking Schedule</h3>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CalendarIcon size={16} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 text-sm font-bold text-slate-900 dark:text-white">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-xs font-bold text-slate-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((d, i) => (
              <button
                key={i}
                disabled={!d}
                onClick={() => d && setSelectedDate(d)}
                className={`text-sm py-2 rounded-lg font-medium transition-all duration-200 ${!d ? 'invisible' :
                  d === selectedDate ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105' :
                    'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking</h3>
          <button className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">See all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white dark:bg-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-50 dark:border-slate-700">
              <tr>
                <th className="px-8 py-6 text-left">Booking ID</th>
                <th className="px-6 py-6 text-left">Guest Name</th>
                <th className="px-6 py-6 text-left">Date</th>
                <th className="px-6 py-6 text-left">Room Type</th>
                <th className="px-6 py-6 text-left">Amount</th>
                <th className="px-6 py-6 text-left">Status</th>
                <th className="px-6 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {bookings.slice(0, 8).map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">#{booking.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 text-xs font-bold overflow-hidden">
                        {/* Mock Avatar */}
                        {booking.user?.name?.[0] || booking.leadName?.[0] || 'G'}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{booking.leadName || booking.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                    {booking.roomType?.name || 'Standard'}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white">
                    ฿{booking.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                      }`}>
                      {booking.status === 'confirmed' ? 'Complete' :
                        booking.status === 'cancelled' ? 'Canceled' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleAction('view', booking.id)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-500 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleAction('delete', booking.id)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW BOOKING MODAL */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h3 className="text-lg font-bold dark:text-white">Booking Details</h3>
              <button onClick={() => setViewBooking(null)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Booking ID</p>
                  <p className="text-lg font-bold text-emerald-500">#{viewBooking.id.slice(-6).toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewBooking.status === 'confirmed' ? 'bg-green-100 text-green-700' : viewBooking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {viewBooking.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold mb-1">Check In</p>
                  <p className="font-medium dark:text-white">{new Date(viewBooking.checkIn).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold mb-1">Check Out</p>
                  <p className="font-medium dark:text-white">{new Date(viewBooking.checkOut).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Guest Information</p>
                <div className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-xl">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                    {viewBooking.leadName?.[0] || 'G'}
                  </div>
                  <div>
                    <p className="font-bold text-sm dark:text-white">{viewBooking.leadName}</p>
                    <p className="text-xs text-slate-500">{viewBooking.leadEmail}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Room & Payment</p>
                <div className="flex justify-between text-sm py-1 border-b dark:border-slate-700">
                  <span className="text-slate-500">Room Type</span>
                  <span className="font-medium dark:text-slate-300">{viewBooking.roomType?.name}</span>
                </div>
                <div className="flex justify-between text-base py-2 font-bold">
                  <span className="text-slate-900 dark:text-white">Total Amount</span>
                  <span className="text-emerald-500">฿{viewBooking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button onClick={() => setViewBooking(null)} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
