import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Plus, CreditCard, Eye } from 'lucide-react'

import BookingDetailModal from '@/components/BookingDetailModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import CreateBookingModal from '@/components/CreateBookingModal'

export default function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)

  // Live Polling
  useEffect(() => {
    let interval
    if (isLiveMode) {
      interval = setInterval(() => {
        const fetchSilent = async () => {
          const query = new URLSearchParams()
          if (searchTerm) query.append('search', searchTerm)
          if (statusFilter !== 'All') query.append('status', statusFilter)
          if (sortConfig.key) {
            query.append('sortBy', sortConfig.key)
            query.append('order', sortConfig.direction)
          }
          const data = await apiFetch(`/bookings/admin/all?${query.toString()}`)
          setBookings(data)
        }
        fetchSilent()
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isLiveMode, searchTerm, statusFilter, sortConfig])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, statusFilter, sortConfig])

  const fetchBookings = async () => {
    if (!isLiveMode) setLoading(true)
    try {
      const query = new URLSearchParams()
      if (searchTerm) query.append('search', searchTerm)
      if (statusFilter !== 'All') query.append('status', statusFilter)
      if (sortConfig.key) {
        query.append('sortBy', sortConfig.key)
        query.append('order', sortConfig.direction)
      }

      const data = await apiFetch(`/bookings/admin/all?${query.toString()}`)
      setBookings(data)
    } catch (error) {
      console.error(error)
    } finally {
      if (!isLiveMode) setLoading(false)
    }
  }

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => { }
  })

  const updateStatus = (id, newStatus) => {
    setConfirmModal({
      isOpen: true,
      title: 'Update Booking Status',
      message: `Are you sure you want to change status to "${newStatus}"?`,
      type: newStatus === 'cancelled' ? 'danger' : 'warning',
      onConfirm: async () => {
        try {
          await apiFetch(`/bookings/admin/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
          fetchBookings()
          setIsDetailOpen(false)
        } catch (error) {
          alert('Update failed')
        }
      }
    })
  }

  const openDetails = (booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
      case 'cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
      case 'checked_in': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB')

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            Booking
            {isLiveMode && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            Manage all reservations
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`text-xs px-2 py-0.5 rounded-full font-bold border transition-all ${isLiveMode ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
            >
              {isLiveMode ? '● Live Updates On' : '○ Live Updates Off'}
            </button>
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Booking
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Pending', 'Confirmed', 'Cancelled', 'Checked_in'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === status
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-slate-900/10'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search guest or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <select
          className="p-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={(e) => {
            const [key, direction] = e.target.value.split('-')
            setSortConfig({ key, direction })
          }}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="checkIn-asc">Check-in (Earliest)</option>
          <option value="checkIn-desc">Check-in (Latest)</option>
          <option value="totalAmount-desc">Price (High-Low)</option>
          <option value="totalAmount-asc">Price (Low-High)</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Check In/Out</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading && !isLiveMode ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No bookings found.</td></tr>
              ) : (
                bookings.map((booking) => {
                  const isNew = new Date(booking.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return (
                    <tr key={booking.id} className={`transition-colors group ${isNew ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            #{booking.id.slice(-6).toUpperCase()}
                          </span>
                          {isNew && <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">NEW</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(booking.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{booking.leadName}</span>
                          <span className="text-xs text-slate-500">{booking.leadEmail}</span>
                          {booking.payment?.provider === 'credit_card' && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                              <CreditCard size={10} /> Paid via Card
                            </div>
                          )}
                          {booking.specialRequests && <span className="text-[10px] text-amber-600 mt-1 truncate max-w-[150px]">★ {booking.specialRequests}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {booking.roomType?.name || 'Unknown Type'}
                        {booking.room && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">#{booking.room.id.slice(-4)}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex flex-col text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">In: {formatDate(booking.checkIn)}</span>
                          <span className="text-rose-600 dark:text-rose-400 font-medium">Out: {formatDate(booking.checkOut)}</span>
                          <span className="text-slate-400 mt-0.5">{Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} nights</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">฿{booking.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetails(booking)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
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

      {showCreateModal && <CreateBookingModal onClose={() => setShowCreateModal(false)} onSuccess={fetchBookings} />}

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


