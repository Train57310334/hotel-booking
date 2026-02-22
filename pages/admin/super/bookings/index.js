import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { CalendarDays, Search, Filter, Loader2, Building2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'
import Head from 'next/head'

export default function PlatformBookingsDashboard() {
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1 })
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 1
    })

    useEffect(() => {
        loadBookings()
    }, [filters.page, filters.status])

    const loadBookings = async () => {
        setLoading(true)
        try {
            const query = new URLSearchParams()
            if (filters.status) query.append('status', filters.status)
            query.append('page', filters.page)
            query.append('limit', 20)

            // Assuming search logic could be added later to the backend
            // if (filters.search) query.append('search', filters.search)

            const data = await apiFetch(`/bookings/super?${query.toString()}`)
            setBookings(data.bookings || [])
            setMeta(data.meta || { currentPage: 1, totalPages: 1 })
        } catch (error) {
            console.error('Failed to load platform bookings:', error)
            toast.error('Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }))
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200'
            case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200'
            case 'checked_in': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200'
            case 'checked_out': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200'
            case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200'
            case 'no_show': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    return (
        <AdminLayout>
            <Head>
                <title>Platform Bookings | Super Admin</title>
            </Head>

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                            <CalendarDays size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Platform Bookings</h1>
                            <p className="text-slate-500 dark:text-slate-400">Aggregate view of all reservations across every tenant.</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Guest Name or Booking ID (Coming Soon)"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                            disabled
                        />
                    </div>
                    <div className="sm:w-48 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold appearance-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked_in">Checked In</option>
                            <option value="checked_out">Checked Out</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">Booking ID</th>
                                    <th className="px-6 py-4">Tenant / Property</th>
                                    <th className="px-6 py-4">Guest</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Room Type</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {bookings.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                            No bookings found matching the criteria.
                                        </td>
                                    </tr>
                                ) : bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                                            {booking.id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-indigo-400" />
                                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]" title={booking.hotel?.name}>
                                                    {booking.hotel?.name || 'Unknown Hotel'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{booking.hotel?.contactEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white capitalize truncate max-w-[150px]">{booking.leadName || booking.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{booking.leadEmail || booking.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 dark:text-white font-medium">
                                                {new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} Nights
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-700 dark:text-slate-300 font-medium text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded truncate max-w-[120px] inline-block">
                                                {booking.roomType?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                                            ฿{booking.totalAmount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusStyle(booking.status)}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(meta.currentPage - 1)}
                                    disabled={meta.currentPage === 1}
                                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(meta.currentPage + 1)}
                                    disabled={meta.currentPage === meta.totalPages}
                                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
